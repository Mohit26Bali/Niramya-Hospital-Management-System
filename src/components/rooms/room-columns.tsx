"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Room } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteRoomAction } from "@/actions/room.actions";
import { RoomForm } from "@/components/rooms/room-form";

function ActionsCell({ room }: { room: Room }) {
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
          title="Delete room?"
          description={`Room "${room.roomNumber}" will be archived and hidden from lists.`}
          onConfirm={async () => {
            await deleteRoomAction(room.id);
            toast.success("Room deleted");
          }}
        />
      </RowActions>

      <FormDialog title="Edit room" open={editOpen} onOpenChange={setEditOpen}>
        {(close) => (
          <RoomForm
            room={room}
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

export const roomColumns: ColumnDef<Room>[] = [
  {
    accessorKey: "roomNumber",
    header: () => <DataTableColumnHeader title="Room #" sortKey="roomNumber" />,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.roomNumber}</span>,
  },
  {
    accessorKey: "type",
    header: () => <DataTableColumnHeader title="Type" sortKey="type" />,
  },
  {
    accessorKey: "floor",
    header: () => <DataTableColumnHeader title="Floor" sortKey="floor" />,
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "ratePerDay",
    header: () => <DataTableColumnHeader title="Rate / day" sortKey="ratePerDay" />,
    cell: ({ row }) => `₹${Number(row.original.ratePerDay).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionsCell room={row.original} />,
  },
];
