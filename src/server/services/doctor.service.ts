import "server-only";
import { generateTempPassword, hashPassword } from "@/lib/password";
import { nextNumber } from "@/lib/sequence";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { DoctorInput, DoctorCreateInput } from "@/schemas/doctor.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };


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


export async function createDoctor(input: DoctorCreateInput, actor: Actor) {
  const { email, ...doctorFields } = input;
  const employeeCode = await nextNumber("DOC");
  // A random temporary password, shown once to the admin. The doctor must replace it at first sign-in.
  const tempPassword = generateTempPassword();
  const passwordHash = hashPassword(tempPassword);

  const doctor = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: `${doctorFields.firstName} ${doctorFields.lastName}`,
        email: email.trim().toLowerCase(),
        passwordHash,
        role: "DOCTOR",
        mustChangePassword: true,
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

  return { doctor, tempPassword };
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
  // Someone with patients waiting cannot just disappear: finish or reassign the work first.
  const [upcoming, open] = await Promise.all([
    prisma.appointment.count({ where: { doctorId: id, status: { in: ["SCHEDULED", "CONFIRMED"] }, scheduledAt: { gte: new Date() } } }),
    prisma.admission.count({ where: { doctorId: id, status: "ADMITTED" } }),
  ]);
  if (upcoming > 0 || open > 0) {
    throw new Error(
      `This doctor still has ${upcoming} upcoming appointment(s) and ${open} admitted patient(s). Reschedule or hand them over first.`
    );
  }

  // Removing a doctor must also end their LOGIN. Before, only the staff record was hidden and the account kept working.
  const doctor = await prisma.$transaction(async (tx) => {
    const d = await tx.doctor.update({ where: { id }, data: { isActive: false, deletedAt: new Date(), isAvailable: false } });
    await tx.user.update({ where: { id: d.userId }, data: { isActive: false } });
    return d;
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
