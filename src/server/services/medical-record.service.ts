import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { MedicalRecordInput, VitalsInput } from "@/schemas/medical-record.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

const includeRelations = {
  patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
  doctor: { select: { id: true, firstName: true, lastName: true } },
} as const;

export async function listMedicalRecords(params: PaginationParams) {
  const where = params.search
    ? {
        OR: [
          { chiefComplaint: { contains: params.search, mode: "insensitive" as const } },
          { diagnosis: { contains: params.search, mode: "insensitive" as const } },
          { patient: { firstName: { contains: params.search, mode: "insensitive" as const } } },
          { patient: { lastName: { contains: params.search, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.medicalRecord.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { visitDate: "desc" },
      include: includeRelations,
    }),
    prisma.medicalRecord.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

function nullifyOptional(input: MedicalRecordInput) {
  return {
    ...input,
    symptoms: input.symptoms || null,
    allergies: input.allergies || null,
    treatmentPlan: input.treatmentPlan || null,
    doctorNotes: input.doctorNotes || null,
  };
}

export async function createMedicalRecord(input: MedicalRecordInput, actor: Actor) {
  const record = await prisma.medicalRecord.create({
    data: nullifyOptional(input),
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "MedicalRecord",
    entityId: record.id,
    details: { diagnosis: record.diagnosis },
  });
  return record;
}

export async function updateMedicalRecord(id: string, input: MedicalRecordInput, actor: Actor) {
  const record = await prisma.medicalRecord.update({
    where: { id },
    data: nullifyOptional(input),
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "MedicalRecord",
    entityId: record.id,
    details: { diagnosis: record.diagnosis },
  });
  return record;
}

export async function updateVitals(id: string, input: VitalsInput, actor: Actor) {
  const record = await prisma.medicalRecord.update({
    where: { id },
    data: {
      temperatureC: input.temperatureC === "" || input.temperatureC === undefined ? null : input.temperatureC,
      bloodPressure: input.bloodPressure || null,
      heartRateBpm: input.heartRateBpm === "" || input.heartRateBpm === undefined ? null : input.heartRateBpm,
      respiratoryRate:
        input.respiratoryRate === "" || input.respiratoryRate === undefined ? null : input.respiratoryRate,
      spo2: input.spo2 === "" || input.spo2 === undefined ? null : input.spo2,
      weightKg: input.weightKg === "" || input.weightKg === undefined ? null : input.weightKg,
      heightCm: input.heightCm === "" || input.heightCm === undefined ? null : input.heightCm,
      nurseNotes: input.nurseNotes || null,
      vitalsUpdatedAt: new Date(),
    },
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "MedicalRecord",
    entityId: record.id,
    details: { vitalsUpdated: true },
  });
  return record;
}

export async function deleteMedicalRecord(id: string, actor: Actor) {
  const record = await prisma.medicalRecord.delete({ where: { id } });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "MedicalRecord",
    entityId: record.id,
    details: { diagnosis: record.diagnosis },
  });
  return record;
}
