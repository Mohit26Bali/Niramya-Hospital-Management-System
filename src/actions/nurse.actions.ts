"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import { nurseSchema, nurseCreateSchema, type NurseInput, type NurseCreateInput } from "@/schemas/nurse.schema";
import * as NurseService from "@/server/services/nurse.service";

export async function listNursesAction(searchParams: Record<string, string | string[] | undefined>) {
  const params = parseSearchParams(searchParams);
  return NurseService.listNurses(params);
}

export async function listAllActiveNursesAction() {
  return NurseService.listAllActiveNurses();
}

export async function createNurseAction(input: NurseCreateInput) {
  const session = await requirePermission("nurse", "create");
  const data = nurseCreateSchema.parse(input);
  await NurseService.createNurse(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/nurses");
}

export async function updateNurseAction(id: string, input: NurseInput) {
  const session = await requirePermission("nurse", "update");
  const data = nurseSchema.parse(input);
  await NurseService.updateNurse(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/nurses");
}

export async function deleteNurseAction(id: string) {
  const session = await requirePermission("nurse", "delete");
  await NurseService.softDeleteNurse(id, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/nurses");
}
