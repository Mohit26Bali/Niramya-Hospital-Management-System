"use server";

import { prisma } from "@/lib/prisma";

/**
 * What the public booking form needs to offer a choice. These are the only actions open to anonymous
 * visitors besides booking and contact, and they return only what the public website already shows:
 * no phone numbers, no account ids, no inactive staff.
 */
export async function listPublicDepartmentsAction() {
  return prisma.department.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function listPublicDoctorsAction() {
  const doctors = await prisma.doctor.findMany({
    where: { isActive: true, isAvailable: true },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      specialization: true,
      departmentId: true,
      consultationFee: true,
      department: { select: { id: true, name: true } },
    },
    orderBy: { lastName: "asc" },
  });
  return doctors.map((d) => ({ ...d, consultationFee: Number(d.consultationFee) }));
}
