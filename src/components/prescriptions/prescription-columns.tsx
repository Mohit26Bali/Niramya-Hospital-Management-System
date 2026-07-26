"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Prescription, PrescriptionItem } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deletePrescriptionAction } from "@/actions/prescription.actions";
import { formatDate } from "@/lib/utils";

export type PrescriptionRow = Prescription & {
  patient: { id: string; firstName: string; lastName: string; patientNumber: string };
  doctor: { id: string; firstName: string; lastName: string };
  items: PrescriptionItem[];
};

function medicationSummary(items: PrescriptionItem[]) {
  if (items.length === 0) return "—";
  const [first, ...rest] = items;
  return rest.length > 0 ? `${first.medicineName} +${rest.length} more` : first.medicineName;
}

function ActionsCell({
  prescription,
  canDelete,
}: {
  prescription: PrescriptionRow;
  canDelete: boolean;
}) {
  if (!canDelete) return null;

  return (
    <RowActions>
      <ConfirmDialog
        trigger={
          <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
            <Trash2 className="mr-2 size-3.5" /> Delete
          </DropdownMenuItem>
        }
        title="Delete prescription?"
        description="This prescription and its medications will be permanently deleted."
        onConfirm={async () => {
          await deletePrescriptionAction(prescription.id);
          toast.success("Prescription deleted");
        }}
      />
    </RowActions>
  );
}

export function getPrescriptionColumns({
  canDelete,
}: {
  canDelete: boolean;
}): ColumnDef<PrescriptionRow>[] {
  return [
    {
      id: "patient",
      accessorFn: (row) => `${row.patient.firstName} ${row.patient.lastName}`,
      header: () => <DataTableColumnHeader title="Patient" />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.patient.firstName} {row.original.patient.lastName}
        </span>
      ),
    },
    {
      id: "doctor",
      accessorFn: (row) => `${row.doctor.firstName} ${row.doctor.lastName}`,
      header: () => <DataTableColumnHeader title="Doctor" />,
      cell: ({ row }) => `Dr. ${row.original.doctor.firstName} ${row.original.doctor.lastName}`,
    },
    {
      accessorKey: "issuedAt",
      header: () => <DataTableColumnHeader title="Issued" sortKey="issuedAt" />,
      cell: ({ row }) => formatDate(row.original.issuedAt),
    },
    {
      id: "medications",
      header: "Medications",
      cell: ({ row }) => medicationSummary(row.original.items),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <ActionsCell prescription={row.original} canDelete={canDelete} />,
    },
  ];
}
