"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { AuditLog } from "@prisma/client";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { formatDateTime } from "@/lib/utils";

export const activityLogColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "createdAt",
    header: () => <DataTableColumnHeader title="Time" sortKey="createdAt" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>
    ),
  },
  {
    accessorKey: "userName",
    header: "User",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.userName}</p>
        <p className="text-xs text-muted-foreground">{row.original.userRole}</p>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <StatusBadge status={row.original.action} />,
  },
  {
    accessorKey: "entity",
    header: "Entity",
  },
  {
    accessorKey: "entityId",
    header: "Entity ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.entityId}</span>
    ),
  },
];
