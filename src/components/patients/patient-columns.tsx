"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Patient } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deletePatientAction } from "@/actions/patient.actions";
import { PatientForm } from "@/components/patients/patient-form";
import { avatarUrl, calculateAge, initials } from "@/lib/utils";

const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

function ActionsCell({ patient }: { patient: Patient }) {
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
          title="Delete patient?"
          description={`"${patient.firstName} ${patient.lastName}" will be archived and hidden from lists.`}
          onConfirm={async () => {
            await deletePatientAction(patient.id);
            toast.success("Patient deleted");
          }}
        />
      </RowActions>

      <FormDialog title="Edit patient" open={editOpen} onOpenChange={setEditOpen}>
        {(close) => (
          <PatientForm
            patient={patient}
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

export const patientColumns: ColumnDef<Patient>[] = [
  {
    id: "name",
    header: () => <DataTableColumnHeader title="Name" sortKey="firstName" />,
    cell: ({ row }) => {
      const patient = row.original;
      const fullName = `${patient.firstName} ${patient.lastName}`;
      return (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarImage src={avatarUrl(patient.avatarSeed)} alt={fullName} />
            <AvatarFallback>{initials(fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              href={`/dashboard/patients/${patient.id}`}
              className="font-medium text-foreground hover:underline"
            >
              {fullName}
            </Link>
            <span className="text-xs text-muted-foreground">{patient.patientNumber}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.gender.toLowerCase()}</span>
    ),
  },
  {
    id: "age",
    header: "Age",
    cell: ({ row }) => calculateAge(row.original.dob),
  },
  {
    id: "bloodGroup",
    header: "Blood Group",
    cell: ({ row }) => {
      const bg = row.original.bloodGroup;
      return bg ? <Badge variant="outline">{BLOOD_GROUP_LABELS[bg]}</Badge> : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell patient={row.original} />,
  },
];
