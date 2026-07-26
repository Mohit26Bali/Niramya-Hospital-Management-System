"use server";

import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import { listAuditLogs } from "@/server/services/audit-log-list.service";

export async function listAuditLogsAction(
  searchParams: Record<string, string | string[] | undefined>
) {
  await requirePermission("settings", "update");
  const params = parseSearchParams(searchParams);
  return listAuditLogs(params);
}
