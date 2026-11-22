"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { revalidatePublicDirectory } from "@/lib/revalidate-public";
import { parseSearchParams } from "@/lib/pagination";
import { departmentSchema, type DepartmentInput } from "@/schemas/department.schema";
import * as DepartmentService from "@/server/services/department.service";

export async function listDepartmentsAction(searchParams: Record<string, string | string[] | undefined>) {
  await requirePermission("department", "read");
  const params = parseSearchParams(searchParams);
  return DepartmentService.listDepartments(params);
}

export async function listAllActiveDepartmentsAction() {
  await requirePermission("department", "read");
  return DepartmentService.listAllActiveDepartments();
}

export async function createDepartmentAction(input: DepartmentInput) {
  const session = await requirePermission("department", "create");
  const data = departmentSchema.parse(input);
  await DepartmentService.createDepartment(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/departments");
  revalidatePublicDirectory();
}

export async function updateDepartmentAction(id: string, input: DepartmentInput) {
  const session = await requirePermission("department", "update");
  const data = departmentSchema.parse(input);
  await DepartmentService.updateDepartment(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/departments");
  revalidatePublicDirectory();
}

export async function deleteDepartmentAction(id: string) {
  const session = await requirePermission("department", "delete");
  await DepartmentService.softDeleteDepartment(id, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/departments");
  revalidatePublicDirectory();
}
