"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import { patientSchema, type PatientInput } from "@/schemas/patient.schema";
import * as PatientService from "@/server/services/patient.service";

export async function listPatientsAction(searchParams: Record<string, string | string[] | undefined>) {
  await requirePermission("patient", "read");
  const params = parseSearchParams(searchParams);
  return PatientService.listPatients(params);
}

export async function listAllActivePatientsAction() {
  await requirePermission("patient", "read");
  return PatientService.listAllActivePatients();
}

export async function getPatientAction(id: string) {
  await requirePermission("patient", "read");
  return PatientService.getPatientById(id);
}

export async function createPatientAction(input: PatientInput) {
  const session = await requirePermission("patient", "create");
  const data = patientSchema.parse(input);
  await PatientService.createPatient(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/patients");
}

export async function updatePatientAction(id: string, input: PatientInput) {
  const session = await requirePermission("patient", "update");
  const data = patientSchema.parse(input);
  await PatientService.updatePatient(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/patients");
  revalidatePath(`/dashboard/patients/${id}`);
}

export async function deletePatientAction(id: string) {
  const session = await requirePermission("patient", "delete");
  await PatientService.softDeletePatient(id, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/patients");
}
