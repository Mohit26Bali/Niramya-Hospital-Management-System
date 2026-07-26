import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listDoctorsAction } from "@/actions/doctor.actions";
import { PageHeader } from "@/components/shared/page-header";
import { DoctorsTable } from "@/components/doctors/doctors-table";

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listDoctorsAction(params)]);

  return (
    <div>
      <PageHeader title="Doctors" description="Manage doctors and their consultation details" />
      <DoctorsTable result={result} canCreate={can(session?.user.role, "doctor", "create")} />
    </div>
  );
}
