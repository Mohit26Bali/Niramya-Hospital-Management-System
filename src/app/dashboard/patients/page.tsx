import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listPatientsAction } from "@/actions/patient.actions";
import { PageHeader } from "@/components/shared/page-header";
import { PatientsTable } from "@/components/patients/patients-table";

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listPatientsAction(params)]);

  return (
    <div>
      <PageHeader title="Patients" description="Manage patient registrations and records" />
      <PatientsTable result={result} canCreate={can(session?.user.role, "patient", "create")} />
    </div>
  );
}
