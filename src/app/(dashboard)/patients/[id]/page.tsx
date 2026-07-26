import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
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

  return (
    <PatientDetail
      patient={patient}
      canUpdate={can(session?.user.role, "patient", "update")}
      canDelete={can(session?.user.role, "patient", "delete")}
    />
  );
}
