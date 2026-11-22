import "server-only";
import { generateTempPassword, hashPassword } from "@/lib/password";
import { nextNumber } from "@/lib/sequence";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { NurseInput, NurseCreateInput } from "@/schemas/nurse.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };


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


export async function createNurse(input: NurseCreateInput, actor: Actor) {
  const { email, departmentId, ...nurseFields } = input;
  const employeeCode = await nextNumber("NUR");
  const tempPassword = generateTempPassword();
  const passwordHash = hashPassword(tempPassword);

  const nurse = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: `${nurseFields.firstName} ${nurseFields.lastName}`,
        email: email.trim().toLowerCase(),
        passwordHash,
        role: "NURSE",
        mustChangePassword: true,
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

  return { nurse, tempPassword };
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
  const open = await prisma.admission.count({ where: { nurseId: id, status: "ADMITTED" } });
  if (open > 0) {
    throw new Error(`This nurse is still assigned to ${open} admitted patient(s). Reassign them first.`);
  }

  // Removing a nurse must also end their LOGIN.
  const nurse = await prisma.$transaction(async (tx) => {
    const n = await tx.nurse.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
    await tx.user.update({ where: { id: n.userId }, data: { isActive: false } });
    return n;
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
