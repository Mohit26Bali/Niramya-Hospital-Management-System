import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { DoctorInput, DoctorCreateInput } from "@/schemas/doctor.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

const DEFAULT_PASSWORD = "password123";

export async function listDoctors(params: PaginationParams) {
  const where = {
    isActive: true,
    ...(params.search
      ? {
          OR: [
            { firstName: { contains: params.search, mode: "insensitive" as const } },
            { lastName: { contains: params.search, mode: "insensitive" as const } },
            { specialization: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.doctor.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { lastName: "asc" },
      include: { department: true },
    }),
    prisma.doctor.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function listAllActiveDoctors() {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true },
    orderBy: { lastName: "asc" },
    include: { department: true },
  });
  return doctors.map((d) => ({ ...d, consultationFee: Number(d.consultationFee) }));
}

async function generateEmployeeCode() {
  const count = await prisma.doctor.count();
  return `DOC-${String(count + 1).padStart(5, "0")}`;
}

export async function createDoctor(input: DoctorCreateInput, actor: Actor) {
  const { email, ...doctorFields } = input;
  const employeeCode = await generateEmployeeCode();
  const passwordHash = bcrypt.hashSync(DEFAULT_PASSWORD, 10);

  const doctor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: `${doctorFields.firstName} ${doctorFields.lastName}`,
        email,
        passwordHash,
        role: "DOCTOR",
      },
    });

    return tx.doctor.create({
      data: {
        userId: user.id,
        employeeCode,
        departmentId: doctorFields.departmentId,
        firstName: doctorFields.firstName,
        lastName: doctorFields.lastName,
        gender: doctorFields.gender,
        specialization: doctorFields.specialization,
        phone: doctorFields.phone,
        qualification: doctorFields.qualification,
        yearsExperience: doctorFields.yearsExperience,
        consultationFee: doctorFields.consultationFee,
        isAvailable: doctorFields.isAvailable,
      },
    });
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Doctor",
    entityId: doctor.id,
    details: { name: `${doctor.firstName} ${doctor.lastName}` },
  });

  return doctor;
}

export async function updateDoctor(id: string, input: DoctorInput, actor: Actor) {
  const doctor = await prisma.$transaction(async (tx) => {
    const updated = await tx.doctor.update({
      where: { id },
      data: {
        departmentId: input.departmentId,
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        specialization: input.specialization,
        phone: input.phone,
        qualification: input.qualification,
        yearsExperience: input.yearsExperience,
        consultationFee: input.consultationFee,
        isAvailable: input.isAvailable,
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
    entity: "Doctor",
    entityId: doctor.id,
    details: { name: `${doctor.firstName} ${doctor.lastName}` },
  });

  return doctor;
}

export async function softDeleteDoctor(id: string, actor: Actor) {
  const doctor = await prisma.doctor.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "Doctor",
    entityId: doctor.id,
    details: { name: `${doctor.firstName} ${doctor.lastName}` },
  });

  return doctor;
}
