import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { AdmissionInput } from "@/schemas/admission.schema";
import { recordAudit } from "@/server/services/audit.service";
import { nextNumber } from "@/lib/sequence";
import { UserError } from "@/lib/action-result";
import type { AdmissionStatus, Prisma, Role } from "@prisma/client";

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

type Tx = Prisma.TransactionClient;

// Open admission -> where it may go. Discharged and transferred stays are history and never reopened.
export const ADMISSION_TRANSITIONS: Record<AdmissionStatus, AdmissionStatus[]> = {
  ADMITTED: ["DISCHARGED", "TRANSFERRED"],
  DISCHARGED: [],
  TRANSFERRED: [],
};

/** Room status follows the beds in use: full = OCCUPIED, otherwise AVAILABLE (a room being cleaned stays that way). */
async function syncRoomStatus(tx: Tx, roomId: string) {
  const room = await tx.room.findUnique({ where: { id: roomId } });
  if (!room) return;
  const used = await tx.admission.count({ where: { roomId, status: "ADMITTED" } });
  if (used === 0 && room.status === "CLEANING") return;
  await tx.room.update({ where: { id: roomId }, data: { status: used >= room.capacity ? "OCCUPIED" : "AVAILABLE" } });
}

/** Everything that must be true before this person can be put in this bed. Takes a lock on the room. */
async function assertCanAdmit(tx: Tx, input: AdmissionInput, ignoreId?: string) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"admissions:room:" + input.roomId}))`;

  const [room, patient, doctor, nurse] = await Promise.all([
    tx.room.findUnique({ where: { id: input.roomId } }),
    tx.patient.findUnique({ where: { id: input.patientId } }),
    tx.doctor.findUnique({ where: { id: input.doctorId } }),
    input.nurseId ? tx.nurse.findUnique({ where: { id: input.nurseId } }) : Promise.resolve(null),
  ]);
  if (!room || !room.isActive) throw new UserError("That room is not in use.");
  if (!patient || !patient.isActive) throw new UserError("That patient could not be found.");
  if (!doctor || !doctor.isActive) throw new UserError("That doctor is no longer available.");
  if (input.nurseId && (!nurse || !nurse.isActive)) throw new UserError("That nurse is no longer available.");

  const others = { status: "ADMITTED" as const, ...(ignoreId ? { id: { not: ignoreId } } : {}) };
  if (await tx.admission.count({ where: { ...others, patientId: input.patientId } })) {
    throw new UserError("This patient is already admitted. Discharge the current stay first.");
  }
  if (room.status === "CLEANING") throw new UserError(`Room ${room.roomNumber} is being cleaned.`);
  const used = await tx.admission.count({ where: { ...others, roomId: input.roomId } });
  if (used >= room.capacity) throw new UserError(`Room ${room.roomNumber} is full.`);
}

export async function createAdmission(input: AdmissionInput, actor: Actor) {
  const admission = await prisma.$transaction(async (tx) => {
    await assertCanAdmit(tx, input);
    const created = await tx.admission.create({
      data: {
        admissionNumber: await nextNumber("ADM", tx),
        patientId: input.patientId,
        doctorId: input.doctorId,
        nurseId: input.nurseId || null,
        roomId: input.roomId,
        admittedBy: input.admittedBy,
        reason: input.reason,
      },
    });
    await syncRoomStatus(tx, input.roomId);
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
    const existing = await tx.admission.findUnique({ where: { id } });
    if (!existing) throw new UserError("That admission no longer exists.");
    if (existing.status !== "ADMITTED") throw new UserError("A finished stay cannot be edited.");
    if (existing.patientId !== input.patientId) {
      throw new UserError("The patient of an admission cannot be changed. Discharge and admit again.");
    }
    await assertCanAdmit(tx, input, id);

    const updated = await tx.admission.update({
      where: { id },
      data: {
        doctorId: input.doctorId,
        nurseId: input.nurseId || null,
        roomId: input.roomId,
        admittedBy: input.admittedBy,
        reason: input.reason,
      },
    });
    if (input.roomId !== existing.roomId) {
      await syncRoomStatus(tx, existing.roomId);
      await syncRoomStatus(tx, input.roomId);
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

async function closeStay(id: string, status: "DISCHARGED" | "TRANSFERRED", summary: string | undefined, actor: Actor) {
  const admission = await prisma.$transaction(async (tx) => {
    const existing = await tx.admission.findUnique({ where: { id } });
    if (!existing) throw new UserError("That admission no longer exists.");
    if (!ADMISSION_TRANSITIONS[existing.status].includes(status)) {
      throw new UserError(`This stay is already ${existing.status.toLowerCase()}.`);
    }
    const updated = await tx.admission.update({
      where: { id },
      data: { status, dischargedAt: new Date(), ...(summary !== undefined ? { dischargeSummary: summary || null } : {}) },
    });
    await syncRoomStatus(tx, existing.roomId);
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

export async function dischargeAdmission(id: string, dischargeSummary: string | undefined, actor: Actor) {
  return closeStay(id, "DISCHARGED", dischargeSummary ?? "", actor);
}

/** Any status change goes through the same rules: discharging or transferring ALWAYS frees the bed. */
export async function updateAdmissionStatus(id: string, status: AdmissionStatus, actor: Actor) {
  if (status === "ADMITTED") throw new UserError("A finished stay cannot be reopened. Admit the patient again.");
  return closeStay(id, status, undefined, actor);
}

export async function deleteAdmission(id: string, actor: Actor) {
  const admission = await prisma.$transaction(async (tx) => {
    const existing = await tx.admission.findUnique({ where: { id }, include: { invoice: { select: { id: true } } } });
    if (!existing) throw new UserError("That admission no longer exists.");
    if (existing.invoice) throw new UserError("This admission has an invoice. Billing records are kept.");

    await tx.admission.delete({ where: { id } });
    await syncRoomStatus(tx, existing.roomId);

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
