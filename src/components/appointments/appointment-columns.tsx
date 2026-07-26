"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, XCircle, CheckCircle2, UserX } from "lucide-react";
import { toast } from "sonner";
import type { Appointment } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cancelAppointmentAction, updateAppointmentStatusAction } from "@/actions/appointment.actions";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { formatDateTime } from "@/lib/utils";

export type AppointmentRow = Appointment & {
  patient: { id: string; firstName: string; lastName: string; patientNumber: string };
  doctor: { id: string; firstName: string; lastName: string };
  department: { id: string; name: string };
};

function ActionsCell({ appointment }: { appointment: AppointmentRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const isFinal = appointment.status === "CANCELLED" || appointment.status === "COMPLETED";

  async function setStatus(status: "COMPLETED" | "NO_SHOW") {
    try {
      await updateAppointmentStatusAction(appointment.id, status);
      toast.success(`Appointment marked ${status === "COMPLETED" ? "completed" : "no-show"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    }
  }

  return (
    <>
      <RowActions>
        <DropdownMenuItem onSelect={() => setEditOpen(true)}>
          <Pencil className="mr-2 size-3.5" /> Edit
        </DropdownMenuItem>
        {!isFinal ? (
          <>
            <DropdownMenuItem onSelect={() => setStatus("COMPLETED")}>
              <CheckCircle2 className="mr-2 size-3.5" /> Mark Completed
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setStatus("NO_SHOW")}>
              <UserX className="mr-2 size-3.5" /> Mark No-Show
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        {!isFinal ? (
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <XCircle className="mr-2 size-3.5" /> Cancel appointment
              </DropdownMenuItem>
            }
            title="Cancel appointment?"
            description={`Appointment ${appointment.appointmentNumber} will be marked as cancelled.`}
            confirmLabel="Cancel appointment"
            onConfirm={async () => {
              await cancelAppointmentAction(appointment.id);
              toast.success("Appointment cancelled");
            }}
          />
        ) : null}
      </RowActions>

      <FormDialog title="Edit appointment" open={editOpen} onOpenChange={setEditOpen}>
        {(close) => (
          <AppointmentForm
            appointment={appointment}
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

export const appointmentColumns: ColumnDef<AppointmentRow>[] = [
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
    id: "department",
    header: "Department",
    cell: ({ row }) => row.original.department.name,
  },
  {
    accessorKey: "scheduledAt",
    header: () => <DataTableColumnHeader title="Scheduled at" sortKey="scheduledAt" />,
    cell: ({ row }) => formatDateTime(row.original.scheduledAt),
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
    cell: ({ row }) => <ActionsCell appointment={row.original} />,
  },
];
