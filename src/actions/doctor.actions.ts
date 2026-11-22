"use server";

import { runAction } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { revalidatePublicDirectory } from "@/lib/revalidate-public";
import { parseSearchParams } from "@/lib/pagination";
import { doctorSchema, doctorCreateSchema, type DoctorInput, type DoctorCreateInput } from "@/schemas/doctor.schema";
import * as DoctorService from "@/server/services/doctor.service";

export async function listDoctorsAction(searchParams: Record<string, string | string[] | undefined>) {
  await requirePermission("doctor", "read");
  const params = parseSearchParams(searchParams);
  return DoctorService.listDoctors(params);
}

export async function listAllActiveDoctorsAction() {
  await requirePermission("doctor", "read");
  return DoctorService.listAllActiveDoctors();
}

export async function createDoctorAction(input: DoctorCreateInput) {
  return runAction(async () => {
    const session = await requirePermission("doctor", "create");
    const data = doctorCreateSchema.parse(input);
    const { tempPassword } = await DoctorService.createDoctor(data, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/doctors");
    revalidatePublicDirectory();
    // Shown to the admin once, never stored in readable form. The doctor must replace it at first sign-in.
    return { tempPassword };
  });
}

export async function updateDoctorAction(id: string, input: DoctorInput) {
  const session = await requirePermission("doctor", "update");
  const data = doctorSchema.parse(input);
  await DoctorService.updateDoctor(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/doctors");
  revalidatePublicDirectory();
}

export async function deleteDoctorAction(id: string) {
  return runAction(async () => {
    const session = await requirePermission("doctor", "delete");
    await DoctorService.softDeleteDoctor(id, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/doctors");
    revalidatePublicDirectory();
  });
}
