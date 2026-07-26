"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import { prescriptionSchema, type PrescriptionInput } from "@/schemas/prescription.schema";
import * as PrescriptionService from "@/server/services/prescription.service";

export async function listPrescriptionsAction(
  searchParams: Record<string, string | string[] | undefined>
) {
  const params = parseSearchParams(searchParams);
  return PrescriptionService.listPrescriptions(params);
}

export async function createPrescriptionAction(input: PrescriptionInput) {
  const session = await requirePermission("prescription", "create");
  const data = prescriptionSchema.parse(input);
  await PrescriptionService.createPrescription(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/prescriptions");
}

export async function deletePrescriptionAction(id: string) {
  const session = await requirePermission("prescription", "delete");
  await PrescriptionService.deletePrescription(id, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/prescriptions");
}
