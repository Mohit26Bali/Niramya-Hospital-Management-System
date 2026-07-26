import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listPrescriptionsAction } from "@/actions/prescription.actions";
import { PageHeader } from "@/components/shared/page-header";
import { PrescriptionsTable } from "@/components/prescriptions/prescriptions-table";

export default async function PrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listPrescriptionsAction(params)]);

  return (
    <div>
      <PageHeader title="Prescriptions" description="Medications prescribed to patients" />
      <PrescriptionsTable
        result={result}
        canCreate={can(session?.user.role, "prescription", "create")}
        canDelete={can(session?.user.role, "prescription", "delete")}
      />
    </div>
  );
}
