"use client";

import { unwrap } from "@/lib/action-result";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, LogOut, ArrowRightLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Admission } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import {
  dischargeAdmissionAction,
  deleteAdmissionAction,
  updateAdmissionStatusAction,
} from "@/actions/admission.actions";
import { AdmissionForm } from "@/components/admissions/admission-form";
import { formatDateTime } from "@/lib/utils";

export type AdmissionRow = Admission & {
  patient: { id: string; firstName: string; lastName: string; patientNumber: string };
  doctor: { id: string; firstName: string; lastName: string };
  nurse: { id: string; firstName: string; lastName: string } | null;
  room: { id: string; roomNumber: string };
};

function ActionsCell({ admission, canDelete }: { admission: AdmissionRow; canDelete: boolean }) {
  const [editOpen, setEditOpen] = useState(false);
  const isAdmitted = admission.status === "ADMITTED";

  return (
    <>
      <RowActions>
        <DropdownMenuItem onSelect={() => setEditOpen(true)}>
          <Pencil className="mr-2 size-3.5" /> Edit
        </DropdownMenuItem>
        {isAdmitted ? (
          <DropdownMenuItem
            onSelect={async () => {
              try {
                unwrap(await updateAdmissionStatusAction(admission.id, "TRANSFERRED"));
                toast.success("Admission marked as transferred");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Something went wrong");
              }
            }}
          >
            <ArrowRightLeft className="mr-2 size-3.5" /> Mark Transferred
          </DropdownMenuItem>
        ) : null}
        {isAdmitted ? (
          <ConfirmDialog
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LogOut className="mr-2 size-3.5" /> Discharge
              </DropdownMenuItem>
            }
            title="Discharge patient?"
            description={`${admission.patient.firstName} ${admission.patient.lastName} will be discharged and room ${admission.room.roomNumber} freed up.`}
            confirmLabel="Discharge"
            variant="default"
            onConfirm={async () => {
              unwrap(await dischargeAdmissionAction(admission.id));
              toast.success("Patient discharged");
            }}
          />
        ) : null}
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <ConfirmDialog
              trigger={
                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="mr-2 size-3.5" /> Delete
                </DropdownMenuItem>
              }
              title="Delete admission record?"
              description={`Admission ${admission.admissionNumber} will be permanently removed. This is an administrative correction and cannot be undone.`}
              onConfirm={async () => {
                await deleteAdmissionAction(admission.id);
                toast.success("Admission deleted");
              }}
            />
          </>
        ) : null}
      </RowActions>

      <FormDialog title="Edit admission" open={editOpen} onOpenChange={setEditOpen}>
        {(close) => (
          <AdmissionForm
            admission={admission}
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

export function buildAdmissionColumns(canDelete: boolean): ColumnDef<AdmissionRow>[] {
  return [
    {
      id: "patient",
      header: "Patient",
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.patient.firstName} {row.original.patient.lastName}
        </span>
      ),
    },
    {
      id: "doctor",
      header: "Doctor",
      cell: ({ row }) => `Dr. ${row.original.doctor.firstName} ${row.original.doctor.lastName}`,
    },
    {
      id: "room",
      header: "Room",
      cell: ({ row }) => row.original.room.roomNumber,
    },
    {
      accessorKey: "admittedAt",
      header: () => <DataTableColumnHeader title="Admitted at" sortKey="admittedAt" />,
      cell: ({ row }) => formatDateTime(row.original.admittedAt),
    },
    {
      id: "dischargedAt",
      header: "Discharged at",
      cell: ({ row }) =>
        row.original.dischargedAt ? formatDateTime(row.original.dischargedAt) : "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <ActionsCell admission={row.original} canDelete={canDelete} />,
    },
  ];
}
