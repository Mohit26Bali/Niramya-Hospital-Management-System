import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { can, requirePermission } from "@/lib/permissions";
import { getPatientChart } from "@/server/services/patient.service";
import { PatientDetail } from "@/components/patients/patient-detail";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Re-checks the account and role in the database, then loads only what this role may see.
  const live = await requirePermission("patient", "read");
  const role = live.user.role;

  const chart = await getPatientChart(
    id,
    { clinical: can(role, "medicalRecord", "read"), billing: can(role, "billing", "read") },
    { id: live.user.id, name: live.user.name ?? "Unknown", role }
  );
  if (!chart) notFound();

  return (
    <PatientDetail
      patient={chart.patient}
      canUpdate={can(role, "patient", "update")}
      canDelete={can(role, "patient", "delete")}
      appointments={JSON.parse(JSON.stringify(chart.appointments))}
      medicalRecords={JSON.parse(JSON.stringify(chart.medicalRecords))}
      prescriptions={JSON.parse(JSON.stringify(chart.prescriptions))}
      admissions={JSON.parse(JSON.stringify(chart.admissions))}
      invoices={JSON.parse(JSON.stringify(chart.invoices))}
      showClinical={can(role, "medicalRecord", "read")}
      showBilling={can(role, "billing", "read")}
    />
  );
}
