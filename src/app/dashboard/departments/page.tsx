import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listDepartmentsAction } from "@/actions/department.actions";
import { PageHeader } from "@/components/shared/page-header";
import { DepartmentsTable } from "@/components/departments/departments-table";

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listDepartmentsAction(params)]);

  return (
    <div>
      <PageHeader title="Departments" description="Manage hospital departments and floors" />
      <DepartmentsTable result={result} canCreate={can(session?.user.role, "department", "create")} />
    </div>
  );
}
