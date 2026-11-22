import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { AppointmentInput } from "@/schemas/appointment.schema";
import { recordAudit } from "@/server/services/audit.service";
import { nextNumber } from "@/lib/sequence";
import { UserError } from "@/lib/action-result";
import { endOfZonedDay, startOfZonedDay } from "@/lib/time";
import { assertBookable, assertNotInPast, assertTransitionAllowed, ACTIVE_STATUSES } from "@/server/services/appointment-rules";
import type { AppointmentStatus, Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

const listInclude = {
  patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
  doctor: { select: { id: true, firstName: true, lastName: true } },
  department: { select: { id: true, name: true } },
} as const;

export async function listAppointments(params: PaginationParams) {
  const where = {
    ...(params.search
      ? {
          OR: [
            { reason: { contains: params.search, mode: "insensitive" as const } },
            { appointmentNumber: { contains: params.search, mode: "insensitive" as const } },
            { patient: { firstName: { contains: params.search, mode: "insensitive" as const } } },
            { patient: { lastName: { contains: params.search, mode: "insensitive" as const } } },
            { doctor: { firstName: { contains: params.search, mode: "insensitive" as const } } },
            { doctor: { lastName: { contains: params.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { scheduledAt: "desc" },
      include: listInclude,
    }),
    prisma.appointment.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function listAllAppointments() {
  return prisma.appointment.findMany({
    orderBy: { scheduledAt: "asc" },
    include: listInclude,
  });
}

export async function listTodaysAppointments() {
  return prisma.appointment.findMany({
    where: { scheduledAt: { gte: startOfZonedDay(), lte: endOfZonedDay() } },
    orderBy: { scheduledAt: "asc" },
    include: listInclude,
  });
}

export async function createAppointment(input: AppointmentInput, actor: Actor) {
  assertNotInPast(input.scheduledAt);

  const appointment = await prisma.$transaction(async (tx) => {
    await assertBookable(tx, input);
    return tx.appointment.create({
      data: {
        appointmentNumber: await nextNumber("APT", tx),
        patientId: input.patientId,
        doctorId: input.doctorId,
        departmentId: input.departmentId,
        scheduledAt: input.scheduledAt,
        durationMins: input.durationMins,
        reason: input.reason,
        notes: input.notes || null,
      },
    });
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Appointment",
    entityId: appointment.id,
    details: { appointmentNumber: appointment.appointmentNumber },
  });

  return appointment;
}

export async function updateAppointment(id: string, input: AppointmentInput, actor: Actor) {
  const appointment = await prisma.$transaction(async (tx) => {
    const existing = await tx.appointment.findUnique({ where: { id } });
    if (!existing) throw new UserError("That appointment no longer exists.");
    if (!ACTIVE_STATUSES.includes(existing.status)) {
      throw new UserError("A finished appointment cannot be edited.");
    }
    // Only re-check the calendar when the doctor, patient or time changed (fixing a note must always work).
    const moved =
      existing.doctorId !== input.doctorId ||
      existing.patientId !== input.patientId ||
      existing.durationMins !== input.durationMins ||
      existing.scheduledAt.getTime() !== input.scheduledAt.getTime();
    if (moved) {
      assertNotInPast(input.scheduledAt);
      await assertBookable(tx, input, id);
    }
    return tx.appointment.update({
      where: { id },
      data: {
        patientId: input.patientId,
        doctorId: input.doctorId,
        departmentId: input.departmentId,
        scheduledAt: input.scheduledAt,
        durationMins: input.durationMins,
        reason: input.reason,
        notes: input.notes || null,
      },
    });
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Appointment",
    entityId: appointment.id,
    details: { appointmentNumber: appointment.appointmentNumber },
  });

  return appointment;
}

export async function cancelAppointment(id: string, actor: Actor) {
  return updateAppointmentStatus(id, "CANCELLED", actor);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, actor: Actor) {
  const appointment = await prisma.$transaction(async (tx) => {
    const existing = await tx.appointment.findUnique({ where: { id } });
    if (!existing) throw new UserError("That appointment no longer exists.");
    assertTransitionAllowed(existing.status, status, existing.scheduledAt);
    if (existing.status === status) return existing;
    return tx.appointment.update({ where: { id }, data: { status } });
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Appointment",
    entityId: appointment.id,
    details: { appointmentNumber: appointment.appointmentNumber, status: appointment.status },
  });

  return appointment;
}
