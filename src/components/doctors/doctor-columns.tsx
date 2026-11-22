"use client";

import { unwrap } from "@/lib/action-result";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Department, Doctor } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteDoctorAction } from "@/actions/doctor.actions";
import { DoctorForm } from "@/components/doctors/doctor-form";

export type DoctorRow = Doctor & { department: Department };

function ActionsCell({ doctor }: { doctor: DoctorRow }) {
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
          title="Delete doctor?"
          description={`Dr. ${doctor.firstName} ${doctor.lastName} will be archived and hidden from lists.`}
          onConfirm={async () => {
            unwrap(await deleteDoctorAction(doctor.id));
            toast.success("Doctor deleted");
          }}
        />
      </RowActions>

      <FormDialog title="Edit doctor" open={editOpen} onOpenChange={setEditOpen}>
        {(close) => (
          <DoctorForm
            doctor={doctor}
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

export const doctorColumns: ColumnDef<DoctorRow>[] = [
  {
    id: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: () => <DataTableColumnHeader title="Name" sortKey="lastName" />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        Dr. {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => row.original.department?.name ?? "—",
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "yearsExperience",
    header: () => <DataTableColumnHeader title="Experience" sortKey="yearsExperience" />,
    cell: ({ row }) => `${row.original.yearsExperience} yrs`,
  },
  {
    id: "isAvailable",
    header: "Availability",
    cell: ({ row }) =>
      row.original.isAvailable ? (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
          Available
        </Badge>
      ) : (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Unavailable
        </Badge>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell doctor={row.original} />,
  },
];
