"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import {
  medicalRecordSchema,
  vitalsSchema,
  type MedicalRecordInput,
  type VitalsInput,
} from "@/schemas/medical-record.schema";
import * as MedicalRecordService from "@/server/services/medical-record.service";

export async function listMedicalRecordsAction(
  searchParams: Record<string, string | string[] | undefined>
) {
  const params = parseSearchParams(searchParams);
  return MedicalRecordService.listMedicalRecords(params);
}

export async function createMedicalRecordAction(input: MedicalRecordInput) {
  const session = await requirePermission("medicalRecord", "create");
  const data = medicalRecordSchema.parse(input);
  await MedicalRecordService.createMedicalRecord(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/medical-records");
}

export async function updateMedicalRecordAction(id: string, input: MedicalRecordInput) {
  const session = await requirePermission("medicalRecord", "update");
  const data = medicalRecordSchema.parse(input);
  await MedicalRecordService.updateMedicalRecord(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/medical-records");
}

export async function updateMedicalRecordVitalsAction(id: string, input: VitalsInput) {
  const session = await requirePermission("medicalRecord", "updateVitals");
  const data = vitalsSchema.parse(input);
  await MedicalRecordService.updateVitals(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/medical-records");
}

export async function deleteMedicalRecordAction(id: string) {
  const session = await requirePermission("medicalRecord", "delete");
  await MedicalRecordService.deleteMedicalRecord(id, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/medical-records");
}
