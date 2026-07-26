import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { AdmissionInput } from "@/schemas/admission.schema";
import { recordAudit } from "@/server/services/audit.service";
import { generateSequenceNumber } from "@/lib/utils";
import type { AdmissionStatus, Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

const listInclude = {
  patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
  doctor: { select: { id: true, firstName: true, lastName: true } },
  nurse: { select: { id: true, firstName: true, lastName: true } },
  room: { select: { id: true, roomNumber: true } },
} as const;

export async function listAdmissions(params: PaginationParams) {
  const where = {
    ...(params.search
      ? {
          OR: [
            { reason: { contains: params.search, mode: "insensitive" as const } },
            { admissionNumber: { contains: params.search, mode: "insensitive" as const } },
            { patient: { firstName: { contains: params.search, mode: "insensitive" as const } } },
            { patient: { lastName: { contains: params.search, mode: "insensitive" as const } } },
            { room: { roomNumber: { contains: params.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.admission.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { admittedAt: "desc" },
      include: listInclude,
    }),
    prisma.admission.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function createAdmission(input: AdmissionInput, actor: Actor) {
  const count = await prisma.admission.count();
  const admissionNumber = generateSequenceNumber("ADM", count + 1);

  const admission = await prisma.$transaction(async (tx) => {
    const created = await tx.admission.create({
      data: {
        admissionNumber,
        patientId: input.patientId,
        doctorId: input.doctorId,
        nurseId: input.nurseId || null,
        roomId: input.roomId,
        admittedBy: input.admittedBy,
        reason: input.reason,
      },
    });

    await tx.room.update({ where: { id: input.roomId }, data: { status: "OCCUPIED" } });

    return created;
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Admission",
    entityId: admission.id,
    details: { admissionNumber: admission.admissionNumber },
  });

  return admission;
}

export async function updateAdmission(id: string, input: AdmissionInput, actor: Actor) {
  const admission = await prisma.$transaction(async (tx) => {
    const existing = await tx.admission.findUniqueOrThrow({ where: { id } });

    const updated = await tx.admission.update({
      where: { id },
      data: {
        patientId: input.patientId,
        doctorId: input.doctorId,
        nurseId: input.nurseId || null,
        roomId: input.roomId,
        admittedBy: input.admittedBy,
        reason: input.reason,
      },
    });

    if (input.roomId !== existing.roomId && existing.status === "ADMITTED") {
      await tx.room.update({ where: { id: existing.roomId }, data: { status: "AVAILABLE" } });
      await tx.room.update({ where: { id: input.roomId }, data: { status: "OCCUPIED" } });
    }

    return updated;
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Admission",
    entityId: admission.id,
    details: { admissionNumber: admission.admissionNumber },
  });

  return admission;
}

export async function dischargeAdmission(
  id: string,
  dischargeSummary: string | undefined,
  actor: Actor
) {
  const admission = await prisma.$transaction(async (tx) => {
    const existing = await tx.admission.findUniqueOrThrow({ where: { id } });

    const updated = await tx.admission.update({
      where: { id },
      data: {
        status: "DISCHARGED",
        dischargedAt: new Date(),
        dischargeSummary: dischargeSummary || null,
      },
    });

    await tx.room.update({ where: { id: existing.roomId }, data: { status: "AVAILABLE" } });

    return updated;
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Admission",
    entityId: admission.id,
    details: { admissionNumber: admission.admissionNumber, status: admission.status },
  });

  return admission;
}

export async function updateAdmissionStatus(id: string, status: AdmissionStatus, actor: Actor) {
  const admission = await prisma.admission.update({
    where: { id },
    data: { status },
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Admission",
    entityId: admission.id,
    details: { admissionNumber: admission.admissionNumber, status: admission.status },
  });

  return admission;
}

export async function deleteAdmission(id: string, actor: Actor) {
  const admission = await prisma.$transaction(async (tx) => {
    const existing = await tx.admission.findUniqueOrThrow({ where: { id } });

    if (existing.status === "ADMITTED") {
      await tx.room.update({ where: { id: existing.roomId }, data: { status: "AVAILABLE" } });
    }

    await tx.admission.delete({ where: { id } });

    return existing;
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "Admission",
    entityId: admission.id,
    details: { admissionNumber: admission.admissionNumber },
  });

  return admission;
}
