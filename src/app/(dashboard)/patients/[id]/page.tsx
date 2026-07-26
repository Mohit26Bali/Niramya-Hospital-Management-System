import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getPatientAction } from "@/actions/patient.actions";
import { PatientDetail } from "@/components/patients/patient-detail";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, patient] = await Promise.all([auth(), getPatientAction(id)]);

  if (!patient) notFound();

  const [appointments, medicalRecords, prescriptions, admissions, invoices] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: id },
      include: { doctor: true, department: true },
      orderBy: { scheduledAt: "desc" },
    }),
    prisma.medicalRecord.findMany({
      where: { patientId: id },
      include: { doctor: true },
      orderBy: { visitDate: "desc" },
    }),
    prisma.prescription.findMany({
      where: { patientId: id },
      include: { doctor: true, items: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.admission.findMany({
      where: { patientId: id },
      include: { doctor: true, room: true },
      orderBy: { admittedAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { patientId: id },
      include: { items: true },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  return (
    <PatientDetail
      patient={patient}
      canUpdate={can(session?.user.role, "patient", "update")}
      canDelete={can(session?.user.role, "patient", "delete")}
      appointments={JSON.parse(JSON.stringify(appointments))}
      medicalRecords={JSON.parse(JSON.stringify(medicalRecords))}
      prescriptions={JSON.parse(JSON.stringify(prescriptions))}
      admissions={JSON.parse(JSON.stringify(admissions))}
      invoices={JSON.parse(JSON.stringify(invoices))}
    />
  );
}
