import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { DepartmentInput } from "@/schemas/department.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

export async function listDepartments(params: PaginationParams) {
  const where = {
    isActive: true,
    ...(params.search
      ? { name: { contains: params.search, mode: "insensitive" as const } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.department.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { name: "asc" },
      include: { _count: { select: { doctors: true, nurses: true } } },
    }),
    prisma.department.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function listAllActiveDepartments() {
  return prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export async function createDepartment(input: DepartmentInput, actor: Actor) {
  const dept = await prisma.department.create({
    data: { ...input, description: input.description || null },
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Department",
    entityId: dept.id,
    details: { name: dept.name },
  });
  return dept;
}

export async function updateDepartment(id: string, input: DepartmentInput, actor: Actor) {
  const dept = await prisma.department.update({
    where: { id },
    data: { ...input, description: input.description || null },
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Department",
    entityId: dept.id,
    details: { name: dept.name },
  });
  return dept;
}

export async function softDeleteDepartment(id: string, actor: Actor) {
  const dept = await prisma.department.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "Department",
    entityId: dept.id,
    details: { name: dept.name },
  });
  return dept;
}
