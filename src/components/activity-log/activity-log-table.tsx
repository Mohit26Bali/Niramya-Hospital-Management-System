"use client";

import type { AuditLog } from "@prisma/client";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { activityLogColumns } from "@/components/activity-log/activity-log-columns";
import type { PaginatedResult } from "@/lib/pagination";

export function ActivityLogTable({ result }: { result: PaginatedResult<AuditLog> }) {
  return (
    <div>
      <DataTableToolbar searchPlaceholder="Search by user or entity…" />
      <DataTable columns={activityLogColumns} data={result.data} emptyTitle="No activity recorded yet" />
      <DataTablePagination
        page={result.page}
        pageCount={result.pageCount}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
