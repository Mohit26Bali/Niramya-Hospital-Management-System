import "server-only";
import { prisma } from "@/lib/prisma";

export type SearchResult = {
  category: "Patient" | "Doctor" | "Department" | "Room" | "Appointment" | "Invoice";
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(
  query: string,
  access: { billing: boolean } = { billing: false }
): Promise<SearchResult[]> {
  const q = query.trim().slice(0, 60);
  if (q.length < 2) return [];

  const [patients, doctors, departments, rooms, invoices] = await Promise.all([
    prisma.patient.findMany({
      where: {
        isActive: true,
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { patientNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.doctor.findMany({
      where: {
        isActive: true,
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { specialization: { contains: q, mode: "insensitive" } },
          { employeeCode: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.department.findMany({
      where: { isActive: true, name: { contains: q, mode: "insensitive" } },
      take: 5,
    }),
    prisma.room.findMany({
      where: { isActive: true, roomNumber: { contains: q, mode: "insensitive" } },
      take: 5,
    }),
    access.billing
      ? prisma.invoice.findMany({
          where: { invoiceNumber: { contains: q, mode: "insensitive" } },
          take: 5,
          include: { patient: true },
        })
      : Promise.resolve([]),
  ]);

  const results: SearchResult[] = [];

  for (const p of patients) {
    results.push({
      category: "Patient",
      id: p.id,
      title: `${p.firstName} ${p.lastName}`,
      subtitle: `${p.patientNumber} · ${p.phone}`,
      href: `/dashboard/patients/${p.id}`,
    });
  }
  for (const d of doctors) {
    results.push({
      category: "Doctor",
      id: d.id,
      title: `Dr. ${d.firstName} ${d.lastName}`,
      subtitle: d.specialization,
      href: `/dashboard/doctors/${d.id}`,
    });
  }
  for (const dep of departments) {
    results.push({
      category: "Department",
      id: dep.id,
      title: dep.name,
      subtitle: `Floor ${dep.floor}`,
      href: `/dashboard/departments/${dep.id}`,
    });
  }
  for (const r of rooms) {
    results.push({
      category: "Room",
      id: r.id,
      title: `Room ${r.roomNumber}`,
      subtitle: r.type,
      href: `/dashboard/rooms/${r.id}`,
    });
  }
  for (const inv of invoices) {
    results.push({
      category: "Invoice",
      id: inv.id,
      title: inv.invoiceNumber,
      subtitle: `${inv.patient.firstName} ${inv.patient.lastName}`,
      href: `/dashboard/billing/${inv.id}`,
    });
  }

  return results;
}
