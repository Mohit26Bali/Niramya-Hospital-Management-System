import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listMedicalRecordsAction } from "@/actions/medical-record.actions";
import { PageHeader } from "@/components/shared/page-header";
import { MedicalRecordsTable } from "@/components/medical-records/medical-records-table";

export default async function MedicalRecordsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listMedicalRecordsAction(params)]);

  return (
    <div>
      <PageHeader title="Medical Records" description="Patient visit history, diagnoses, and vitals" />
      <MedicalRecordsTable
        result={result}
        canCreate={can(session?.user.role, "medicalRecord", "create")}
        canEdit={can(session?.user.role, "medicalRecord", "update")}
        canDelete={can(session?.user.role, "medicalRecord", "delete")}
        canUpdateVitals={can(session?.user.role, "medicalRecord", "updateVitals")}
      />
    </div>
  );
}
