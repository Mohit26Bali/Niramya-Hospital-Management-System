"use client";

import { useState } from "react";
import { BedDouble, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Room } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteRoomAction } from "@/actions/room.actions";
import { RoomForm } from "@/components/rooms/room-form";
import { cn } from "@/lib/utils";

const STATUS_BORDER: Record<Room["status"], string> = {
  AVAILABLE: "border-l-emerald-400 dark:border-l-emerald-500",
  OCCUPIED: "border-l-red-400 dark:border-l-red-500",
  CLEANING: "border-l-slate-300 dark:border-l-slate-600",
};

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function RoomCard({ room, canEdit }: { room: Room; canEdit: boolean }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(
          "rounded-xl border-l-4 border-border shadow-none transition-shadow duration-150 hover:shadow-sm",
          STATUS_BORDER[room.status]
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
              <BedDouble className="size-4.5 text-primary" />
            </div>
            {canEdit ? (
              <RowActions>
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <Pencil className="mr-2 size-3.5" /> Edit
                </DropdownMenuItem>
                <ConfirmDialog
                  trigger={
                    <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
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
            ) : null}
          </div>

          <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {room.roomNumber}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {toTitleCase(room.type)}
            </span>
            <StatusBadge status={room.status} />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Floor {room.floor}</span>
            <span>₹{Number(room.ratePerDay).toFixed(2)} / day</span>
          </div>
        </CardContent>
      </Card>

      {canEdit ? (
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
      ) : null}
    </>
  );
}
