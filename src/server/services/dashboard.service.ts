import "server-only";
import { prisma } from "@/lib/prisma";
import { HOSPITAL_TIMEZONE, endOfZonedDay, startOfZonedDay, startOfZonedMonth } from "@/lib/time";

// "Today" and "this month" mean the hospital's calendar, not the server's (a UTC server would roll over at 5:30 am).
const startOfDay = (date = new Date()) => startOfZonedDay(date);
const endOfDay = (date = new Date()) => endOfZonedDay(date);
const startOfMonth = (date = new Date()) => startOfZonedMonth(date);
const startOfPrevMonth = (date = new Date()) => startOfZonedMonth(new Date(startOfZonedMonth(date).getTime() - 1));
const endOfPrevMonth = (date = new Date()) => new Date(startOfZonedMonth(date).getTime() - 1);

function trendPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export async function getStatCards() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const prevMonthStart = startOfPrevMonth(now);
  const prevMonthEnd = endOfPrevMonth(now);

  const [
    totalPatients,
    totalDoctors,
    totalNurses,
    todaysAppointments,
    upcomingAppointments,
    occupiedRooms,
    totalRooms,
    admissionsToday,
    dischargedToday,
    patientsAddedToday,
    pendingInvoices,
    revenueThisMonth,
    revenuePrevMonth,
    patientsPrevMonthToDate,
    doctorsOnDuty,
  ] = await Promise.all([
    prisma.patient.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { isActive: true } }),
    prisma.nurse.count({ where: { isActive: true } }),
    prisma.appointment.count({ where: { scheduledAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({
      where: { scheduledAt: { gte: now, lte: new Date(now.getTime() + 7 * 86400000) } },
    }),
    prisma.room.count({ where: { status: "OCCUPIED" } }),
    prisma.room.count({ where: { isActive: true } }),
    prisma.admission.count({ where: { admittedAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.admission.count({ where: { dischargedAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.patient.count({ where: { registeredAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.invoice.aggregate({
      _count: true,
      _sum: { totalAmount: true, paidAmount: true },
      where: { status: { in: ["PENDING", "PARTIALLY_PAID"] } },
    }),
    prisma.invoice.aggregate({
      _sum: { paidAmount: true },
      where: { paidAt: { gte: monthStart } },
    }),
    prisma.invoice.aggregate({
      _sum: { paidAmount: true },
      where: { paidAt: { gte: prevMonthStart, lte: prevMonthEnd } },
    }),
    prisma.patient.count({ where: { registeredAt: { lte: prevMonthEnd } } }),
    prisma.doctor.count({ where: { isActive: true, isAvailable: true } }),
  ]);

  const revenueThisMonthValue = Number(revenueThisMonth._sum.paidAmount ?? 0);
  const revenuePrevMonthValue = Number(revenuePrevMonth._sum.paidAmount ?? 0);

  return {
    totalPatients,
    totalDoctors,
    totalNurses,
    todaysAppointments,
    upcomingAppointments,
    occupiedRooms,
    totalRooms,
    bedOccupancyPct: totalRooms === 0 ? 0 : (occupiedRooms / totalRooms) * 100,
    admissionsToday,
    dischargedToday,
    patientsAddedToday,
    pendingBillsCount: pendingInvoices._count,
    pendingBillsAmount:
      Number(pendingInvoices._sum.totalAmount ?? 0) - Number(pendingInvoices._sum.paidAmount ?? 0),
    revenueThisMonth: revenueThisMonthValue,
    revenueTrendPct: trendPct(revenueThisMonthValue, revenuePrevMonthValue),
    patientsTrendPct: trendPct(totalPatients, patientsPrevMonthToDate),
    doctorsOnDuty,
  };
}

export async function getRevenueByMonth() {
  const rows = await prisma.$queryRaw<{ month: Date; revenue: number }[]>`
    SELECT date_trunc('month', timezone(${HOSPITAL_TIMEZONE}, "paidAt" AT TIME ZONE 'UTC')) AS month, SUM("paidAmount")::float AS revenue
    FROM "Invoice"
    WHERE "paidAt" IS NOT NULL AND "paidAt" >= NOW() - INTERVAL '11 months'
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows.map((r) => ({ month: r.month, revenue: r.revenue ?? 0 }));
}

export async function getAppointmentsByMonth() {
  const rows = await prisma.$queryRaw<{ month: Date; count: number }[]>`
    SELECT date_trunc('month', timezone(${HOSPITAL_TIMEZONE}, "scheduledAt" AT TIME ZONE 'UTC')) AS month, COUNT(*)::int AS count
    FROM "Appointment"
    WHERE "scheduledAt" >= NOW() - INTERVAL '11 months'
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows.map((r) => ({ month: r.month, count: r.count }));
}

export async function getPatientsByDepartment() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      _count: { select: { patients: true } },
    },
    orderBy: { name: "asc" },
  });
  return departments.map((d) => ({ department: d.name, patients: d._count.patients }));
}

export async function getGenderDistribution() {
  const rows = await prisma.patient.groupBy({
    by: ["gender"],
    where: { isActive: true },
    _count: true,
  });
  return rows.map((r) => ({ gender: r.gender, count: r._count }));
}

export async function getAgeDistribution() {
  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    select: { dob: true },
  });
  const buckets = { "0-18": 0, "19-35": 0, "36-50": 0, "51-65": 0, "65+": 0 };
  const now = new Date();
  for (const p of patients) {
    const age = now.getFullYear() - p.dob.getFullYear();
    if (age <= 18) buckets["0-18"]++;
    else if (age <= 35) buckets["19-35"]++;
    else if (age <= 50) buckets["36-50"]++;
    else if (age <= 65) buckets["51-65"]++;
    else buckets["65+"]++;
  }
  return Object.entries(buckets).map(([ageRange, count]) => ({ ageRange, count }));
}

export async function getRoomOccupancy() {
  const rows = await prisma.room.groupBy({
    by: ["type", "status"],
    where: { isActive: true },
    _count: true,
  });
  return rows.map((r) => ({ type: r.type, status: r.status, count: r._count }));
}

export async function getRecentPatients() {
  return prisma.patient.findMany({
    where: { isActive: true },
    orderBy: { registeredAt: "desc" },
    take: 5,
  });
}

export async function getTodaysAppointmentsList() {
  return prisma.appointment.findMany({
    where: { scheduledAt: { gte: startOfDay(), lte: endOfDay() } },
    orderBy: { scheduledAt: "asc" },
    take: 6,
    include: { patient: true, doctor: true },
  });
}

export async function getLatestAdmissions() {
  return prisma.admission.findMany({
    orderBy: { admittedAt: "desc" },
    take: 5,
    include: { patient: true, room: true },
  });
}

export async function getLatestInvoices() {
  return prisma.invoice.findMany({
    orderBy: { issuedAt: "desc" },
    take: 5,
    include: { patient: true },
  });
}
