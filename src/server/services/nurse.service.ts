import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { NurseInput, NurseCreateInput } from "@/schemas/nurse.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

const DEFAULT_PASSWORD = "password123";

export async function listNurses(params: PaginationParams) {
  const where = {
    isActive: true,
    ...(params.search
      ? {
          OR: [
            { firstName: { contains: params.search, mode: "insensitive" as const } },
            { lastName: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.nurse.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { lastName: "asc" },
      include: { department: true },
    }),
    prisma.nurse.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function listAllActiveNurses() {
  return prisma.nurse.findMany({
    where: { isActive: true },
    orderBy: { lastName: "asc" },
    include: { department: true },
  });
}

async function generateEmployeeCode() {
  const count = await prisma.nurse.count();
  return `NUR-${String(count + 1).padStart(5, "0")}`;
}

export async function createNurse(input: NurseCreateInput, actor: Actor) {
  const { email, departmentId, ...nurseFields } = input;
  const employeeCode = await generateEmployeeCode();
  const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

  const nurse = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: `${nurseFields.firstName} ${nurseFields.lastName}`,
        email,
        passwordHash,
        role: "NURSE",
      },
    });

    return tx.nurse.create({
      data: {
        userId: user.id,
        employeeCode,
        departmentId: departmentId || null,
        firstName: nurseFields.firstName,
        lastName: nurseFields.lastName,
        gender: nurseFields.gender,
        phone: nurseFields.phone,
        shift: nurseFields.shift,
      },
    });
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Nurse",
    entityId: nurse.id,
    details: { name: `${nurse.firstName} ${nurse.lastName}` },
  });

  return nurse;
}

export async function updateNurse(id: string, input: NurseInput, actor: Actor) {
  const nurse = await prisma.$transaction(async (tx) => {
    const updated = await tx.nurse.update({
      where: { id },
      data: {
        departmentId: input.departmentId || null,
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        phone: input.phone,
        shift: input.shift,
      },
    });

    await tx.user.update({
      where: { id: updated.userId },
      data: { name: `${updated.firstName} ${updated.lastName}` },
    });

    return updated;
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Nurse",
    entityId: nurse.id,
    details: { name: `${nurse.firstName} ${nurse.lastName}` },
  });

  return nurse;
}

export async function softDeleteNurse(id: string, actor: Actor) {
  const nurse = await prisma.nurse.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "Nurse",
    entityId: nurse.id,
    details: { name: `${nurse.firstName} ${nurse.lastName}` },
  });

  return nurse;
}
