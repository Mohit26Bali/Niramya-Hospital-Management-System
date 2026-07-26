import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listAdmissionsAction } from "@/actions/admission.actions";
import { PageHeader } from "@/components/shared/page-header";
import { AdmissionsTable } from "@/components/admissions/admissions-table";
import type { AdmissionRow } from "@/components/admissions/admission-columns";

export default async function AdmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listAdmissionsAction(params)]);

  return (
    <div>
      <PageHeader title="Admissions" description="Manage patient admissions, transfers, and discharges" />
      <AdmissionsTable
        result={{ ...result, data: JSON.parse(JSON.stringify(result.data)) as AdmissionRow[] }}
        canCreate={can(session?.user.role, "admission", "create")}
        canDelete={can(session?.user.role, "admission", "delete")}
        defaultAdmittedBy={session?.user.name ?? ""}
      />
    </div>
  );
}
