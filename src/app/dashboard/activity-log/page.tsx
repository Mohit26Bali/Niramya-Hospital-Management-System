import { listAuditLogsAction } from "@/actions/audit-log.actions";
import { PageHeader } from "@/components/shared/page-header";
import { ActivityLogTable } from "@/components/activity-log/activity-log-table";

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const result = await listAuditLogsAction(params);

  return (
    <div>
      <PageHeader title="Activity Log" description="A record of who did what, across the system" />
      <ActivityLogTable result={result} />
    </div>
  );
}
