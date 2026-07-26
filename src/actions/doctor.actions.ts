"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import { doctorSchema, doctorCreateSchema, type DoctorInput, type DoctorCreateInput } from "@/schemas/doctor.schema";
import * as DoctorService from "@/server/services/doctor.service";

export async function listDoctorsAction(searchParams: Record<string, string | string[] | undefined>) {
  const params = parseSearchParams(searchParams);
  return DoctorService.listDoctors(params);
}

export async function listAllActiveDoctorsAction() {
  return DoctorService.listAllActiveDoctors();
}

export async function createDoctorAction(input: DoctorCreateInput) {
  const session = await requirePermission("doctor", "create");
  const data = doctorCreateSchema.parse(input);
  await DoctorService.createDoctor(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/doctors");
}

export async function updateDoctorAction(id: string, input: DoctorInput) {
  const session = await requirePermission("doctor", "update");
  const data = doctorSchema.parse(input);
  await DoctorService.updateDoctor(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/doctors");
}

export async function deleteDoctorAction(id: string) {
  const session = await requirePermission("doctor", "delete");
  await DoctorService.softDeleteDoctor(id, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/doctors");
}
