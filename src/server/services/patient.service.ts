import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { PatientInput } from "@/schemas/patient.schema";
import { recordAudit } from "@/server/services/audit.service";
import { nextNumber } from "@/lib/sequence";
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
  const patientNumber = await nextNumber("PAT");

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

/**
 * Everything the patient page shows, limited to what the viewer's role may see: the front desk gets
 * appointments, admissions and bills but no clinical notes or prescriptions; doctors and nurses get the
 * clinical record but no bills. Each opening of a chart is written to the audit log (who looked at whom).
 */
export async function getPatientChart(
  id: string,
  access: { clinical: boolean; billing: boolean },
  actor: Actor
) {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return null;

  const [appointments, medicalRecords, prescriptions, admissions, invoices] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: id },
      include: { doctor: true, department: true },
      orderBy: { scheduledAt: "desc" },
    }),
    access.clinical
      ? prisma.medicalRecord.findMany({ where: { patientId: id }, include: { doctor: true }, orderBy: { visitDate: "desc" } })
      : Promise.resolve([]),
    access.clinical
      ? prisma.prescription.findMany({ where: { patientId: id }, include: { doctor: true, items: true }, orderBy: { issuedAt: "desc" } })
      : Promise.resolve([]),
    prisma.admission.findMany({
      where: { patientId: id },
      include: { doctor: true, room: true },
      orderBy: { admittedAt: "desc" },
    }),
    access.billing
      ? prisma.invoice.findMany({ where: { patientId: id }, include: { items: true }, orderBy: { issuedAt: "desc" } })
      : Promise.resolve([]),
  ]);

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "VIEW",
    entity: "Patient",
    entityId: patient.id,
    details: { patientNumber: patient.patientNumber },
  });

  return { patient, appointments, medicalRecords, prescriptions, admissions, invoices };
}
