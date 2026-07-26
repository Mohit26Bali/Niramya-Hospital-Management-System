"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { hospitalProfileSchema, type HospitalProfileInput } from "@/schemas/settings.schema";
import * as SettingsService from "@/server/services/settings.service";

export async function getHospitalProfileAction() {
  return SettingsService.getHospitalProfile();
}

export async function updateHospitalProfileAction(input: HospitalProfileInput) {
  const session = await requirePermission("settings", "update");
  const data = hospitalProfileSchema.parse(input);
  await SettingsService.updateHospitalProfile(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/settings");
}
