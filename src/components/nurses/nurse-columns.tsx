"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Department, Nurse } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteNurseAction } from "@/actions/nurse.actions";
import { NurseForm } from "@/components/nurses/nurse-form";

export type NurseRow = Nurse & { department: Department | null };

function ActionsCell({ nurse }: { nurse: NurseRow }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <RowActions>
        <DropdownMenuItem onSelect={() => setEditOpen(true)}>
          <Pencil className="mr-2 size-3.5" /> Edit
        </DropdownMenuItem>
        <ConfirmDialog
          trigger={
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="mr-2 size-3.5" /> Delete
            </DropdownMenuItem>
          }
          title="Delete nurse?"
          description={`${nurse.firstName} ${nurse.lastName} will be archived and hidden from lists.`}
          onConfirm={async () => {
            await deleteNurseAction(nurse.id);
            toast.success("Nurse deleted");
          }}
        />
      </RowActions>

      <FormDialog title="Edit nurse" open={editOpen} onOpenChange={setEditOpen}>
        {(close) => (
          <NurseForm
            nurse={nurse}
            onSuccess={() => {
              close();
              setEditOpen(false);
            }}
          />
        )}
      </FormDialog>
    </>
  );
}

const SHIFT_LABELS: Record<string, string> = {
  MORNING: "Morning",
  EVENING: "Evening",
  NIGHT: "Night",
};

export const nurseColumns: ColumnDef<NurseRow>[] = [
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: () => <DataTableColumnHeader title="Name" sortKey="lastName" />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => row.original.department?.name ?? "—",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    id: "shift",
    header: "Shift",
    cell: ({ row }) => <Badge variant="outline">{SHIFT_LABELS[row.original.shift]}</Badge>,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell nurse={row.original} />,
  },
];
