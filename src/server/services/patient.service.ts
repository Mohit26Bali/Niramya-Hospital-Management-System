import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { PatientInput } from "@/schemas/patient.schema";
import { recordAudit } from "@/server/services/audit.service";
import { generateSequenceNumber } from "@/lib/utils";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

export async function listPatients(params: PaginationParams) {
  const where = {
    isActive: true,
    ...(params.search
      ? {
          OR: [
            { firstName: { contains: params.search, mode: "insensitive" as const } },
            { lastName: { contains: params.search, mode: "insensitive" as const } },
            { phone: { contains: params.search, mode: "insensitive" as const } },
            { patientNumber: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { createdAt: "desc" },
    }),
    prisma.patient.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function listAllActivePatients() {
  return prisma.patient.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, patientNumber: true },
    orderBy: { firstName: "asc" },
  });
}

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({ where: { id } });
}

export async function createPatient(input: PatientInput, actor: Actor) {
  const count = await prisma.patient.count();
  const patientNumber = generateSequenceNumber("PAT", count + 1);

  const patient = await prisma.patient.create({
    data: {
      ...input,
      email: input.email || null,
      bloodGroup: input.bloodGroup || null,
      insuranceProvider: input.insuranceProvider || null,
      insuranceNumber: input.insuranceNumber || null,
      allergies: input.allergies || null,
      chronicConditions: input.chronicConditions || null,
      patientNumber,
      avatarSeed: patientNumber,
    },
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Patient",
    entityId: patient.id,
    details: { patientNumber: patient.patientNumber, name: `${patient.firstName} ${patient.lastName}` },
  });

  return patient;
}

export async function updatePatient(id: string, input: PatientInput, actor: Actor) {
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...input,
      email: input.email || null,
      bloodGroup: input.bloodGroup || null,
      insuranceProvider: input.insuranceProvider || null,
      insuranceNumber: input.insuranceNumber || null,
      allergies: input.allergies || null,
      chronicConditions: input.chronicConditions || null,
    },
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Patient",
    entityId: patient.id,
    details: { patientNumber: patient.patientNumber, name: `${patient.firstName} ${patient.lastName}` },
  });

  return patient;
}

export async function softDeletePatient(id: string, actor: Actor) {
  const patient = await prisma.patient.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "Patient",
    entityId: patient.id,
    details: { patientNumber: patient.patientNumber, name: `${patient.firstName} ${patient.lastName}` },
  });

  return patient;
}
