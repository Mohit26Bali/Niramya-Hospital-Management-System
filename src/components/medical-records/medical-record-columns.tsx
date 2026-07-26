"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2, Activity } from "lucide-react";
import { toast } from "sonner";
import type { MedicalRecord } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteMedicalRecordAction } from "@/actions/medical-record.actions";
import { MedicalRecordForm } from "@/components/medical-records/medical-record-form";
import { VitalsForm } from "@/components/medical-records/vitals-form";
import { formatDate } from "@/lib/utils";

export type MedicalRecordRow = MedicalRecord & {
  patient: { id: string; firstName: string; lastName: string; patientNumber: string };
  doctor: { id: string; firstName: string; lastName: string };
};

function ActionsCell({
  record,
  canEdit,
  canDelete,
  canUpdateVitals,
}: {
  record: MedicalRecordRow;
  canEdit: boolean;
  canDelete: boolean;
  canUpdateVitals: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [vitalsOpen, setVitalsOpen] = useState(false);

  if (!canEdit && !canDelete && !canUpdateVitals) return null;

  return (
    <>
      <RowActions>
        {canEdit ? (
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 size-3.5" /> Edit
          </DropdownMenuItem>
        ) : null}
        {canUpdateVitals ? (
          <DropdownMenuItem onSelect={() => setVitalsOpen(true)}>
            <Activity className="mr-2 size-3.5" /> Update Vitals
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <ConfirmDialog
            trigger={
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="mr-2 size-3.5" /> Delete
              </DropdownMenuItem>
            }
            title="Delete medical record?"
            description="This record will be permanently deleted."
            onConfirm={async () => {
              await deleteMedicalRecordAction(record.id);
              toast.success("Medical record deleted");
            }}
          />
        ) : null}
      </RowActions>

      {canEdit ? (
        <FormDialog title="Edit medical record" open={editOpen} onOpenChange={setEditOpen}>
          {(close) => (
            <MedicalRecordForm
              medicalRecord={record}
              onSuccess={() => {
                close();
                setEditOpen(false);
              }}
            />
          )}
        </FormDialog>
      ) : null}

      {canUpdateVitals ? (
        <FormDialog title="Update vitals" open={vitalsOpen} onOpenChange={setVitalsOpen}>
          {(close) => (
            <VitalsForm
              medicalRecord={record}
              onSuccess={() => {
                close();
                setVitalsOpen(false);
              }}
            />
          )}
        </FormDialog>
      ) : null}
    </>
  );
}

export function getMedicalRecordColumns({
  canEdit,
  canDelete,
  canUpdateVitals,
}: {
  canEdit: boolean;
  canDelete: boolean;
  canUpdateVitals: boolean;
}): ColumnDef<MedicalRecordRow>[] {
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
      accessorKey: "visitDate",
      header: () => <DataTableColumnHeader title="Visit date" sortKey="visitDate" />,
      cell: ({ row }) => formatDate(row.original.visitDate),
    },
    {
      accessorKey: "chiefComplaint",
      header: "Chief complaint",
    },
    {
      accessorKey: "diagnosis",
      header: "Diagnosis",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <ActionsCell
          record={row.original}
          canEdit={canEdit}
          canDelete={canDelete}
          canUpdateVitals={canUpdateVitals}
        />
      ),
    },
  ];
}
