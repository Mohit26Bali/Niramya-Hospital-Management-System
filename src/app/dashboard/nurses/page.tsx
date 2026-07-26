import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listNursesAction } from "@/actions/nurse.actions";
import { PageHeader } from "@/components/shared/page-header";
import { NursesTable } from "@/components/nurses/nurses-table";

export default async function NursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listNursesAction(params)]);

  return (
    <div>
      <PageHeader title="Nurses" description="Manage nurses and their shift assignments" />
      <NursesTable result={result} canCreate={can(session?.user.role, "nurse", "create")} />
    </div>
  );
}
