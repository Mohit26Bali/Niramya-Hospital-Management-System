import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { PrescriptionInput } from "@/schemas/prescription.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

const includeRelations = {
  patient: { select: { id: true, firstName: true, lastName: true, patientNumber: true } },
  doctor: { select: { id: true, firstName: true, lastName: true } },
  items: true,
} as const;

export async function listPrescriptions(params: PaginationParams) {
  const where = params.search
    ? {
        OR: [
          { patient: { firstName: { contains: params.search, mode: "insensitive" as const } } },
          { patient: { lastName: { contains: params.search, mode: "insensitive" as const } } },
          { items: { some: { medicineName: { contains: params.search, mode: "insensitive" as const } } } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.prescription.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { issuedAt: "desc" },
      include: includeRelations,
    }),
    prisma.prescription.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function createPrescription(input: PrescriptionInput, actor: Actor) {
  const prescription = await prisma.prescription.create({
    data: {
      patientId: input.patientId,
      doctorId: input.doctorId,
      notes: input.notes || null,
      items: {
        create: input.items.map((item) => ({
          medicineName: item.medicineName,
          dosage: item.dosage,
          frequency: item.frequency,
          durationDays: item.durationDays,
          instructions: item.instructions || null,
        })),
      },
    },
    include: includeRelations,
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Prescription",
    entityId: prescription.id,
    details: { itemCount: prescription.items.length },
  });
  return prescription;
}

export async function deletePrescription(id: string, actor: Actor) {
  const prescription = await prisma.prescription.delete({ where: { id } });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "Prescription",
    entityId: prescription.id,
    details: {},
  });
  return prescription;
}
