import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { AppointmentInput } from "@/schemas/appointment.schema";
import { recordAudit } from "@/server/services/audit.service";
import { generateSequenceNumber } from "@/lib/utils";
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
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return prisma.appointment.findMany({
    where: { scheduledAt: { gte: start, lte: end } },
    orderBy: { scheduledAt: "asc" },
    include: listInclude,
  });
}

export async function createAppointment(input: AppointmentInput, actor: Actor) {
  const count = await prisma.appointment.count();
  const appointmentNumber = generateSequenceNumber("APT", count + 1);

  const appointment = await prisma.appointment.create({
    data: {
      appointmentNumber,
      patientId: input.patientId,
      doctorId: input.doctorId,
      departmentId: input.departmentId,
      scheduledAt: input.scheduledAt,
      durationMins: input.durationMins,
      reason: input.reason,
      notes: input.notes || null,
    },
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
  const appointment = await prisma.appointment.update({
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
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
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

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  actor: Actor
) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
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
