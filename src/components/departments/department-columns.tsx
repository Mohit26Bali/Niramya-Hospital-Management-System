"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Department } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteDepartmentAction } from "@/actions/department.actions";
import { DepartmentForm } from "@/components/departments/department-form";

type DepartmentRow = Department & { _count: { doctors: number; nurses: number } };

function ActionsCell({ department }: { department: DepartmentRow }) {
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
          title="Delete department?"
          description={`"${department.name}" will be archived and hidden from lists.`}
          onConfirm={async () => {
            await deleteDepartmentAction(department.id);
            toast.success("Department deleted");
          }}
        />
      </RowActions>

      <FormDialog title="Edit department" open={editOpen} onOpenChange={setEditOpen}>
        {(close) => (
          <DepartmentForm
            department={department}
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

export const departmentColumns: ColumnDef<DepartmentRow>[] = [
  {
    accessorKey: "name",
    header: () => <DataTableColumnHeader title="Name" sortKey="name" />,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
  },
  {
    accessorKey: "floor",
    header: () => <DataTableColumnHeader title="Floor" sortKey="floor" />,
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    id: "doctors",
    header: "Doctors",
    cell: ({ row }) => row.original._count.doctors,
  },
  {
    id: "nurses",
    header: "Nurses",
    cell: ({ row }) => row.original._count.nurses,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell department={row.original} />,
  },
];
