"use server";

import { runAction } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import { nurseSchema, nurseCreateSchema, type NurseInput, type NurseCreateInput } from "@/schemas/nurse.schema";
import * as NurseService from "@/server/services/nurse.service";

export async function listNursesAction(searchParams: Record<string, string | string[] | undefined>) {
  await requirePermission("nurse", "read");
  const params = parseSearchParams(searchParams);
  return NurseService.listNurses(params);
}

export async function listAllActiveNursesAction() {
  await requirePermission("admission", "read");
  return NurseService.listAllActiveNurses();
}

export async function createNurseAction(input: NurseCreateInput) {
  return runAction(async () => {
    const session = await requirePermission("nurse", "create");
    const data = nurseCreateSchema.parse(input);
    const { tempPassword } = await NurseService.createNurse(data, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/nurses");
    return { tempPassword };
  });
}

export async function updateNurseAction(id: string, input: NurseInput) {
  const session = await requirePermission("nurse", "update");
  const data = nurseSchema.parse(input);
  await NurseService.updateNurse(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/nurses");
}

export async function deleteNurseAction(id: string) {
  return runAction(async () => {
    const session = await requirePermission("nurse", "delete");
    await NurseService.softDeleteNurse(id, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/nurses");
  });
}
