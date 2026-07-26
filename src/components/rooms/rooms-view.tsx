"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Room } from "@prisma/client";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { roomColumns } from "@/components/rooms/room-columns";
import { RoomForm } from "@/components/rooms/room-form";
import { RoomCard } from "@/components/rooms/room-card";
import type { PaginatedResult } from "@/lib/pagination";

export function RoomsView({
  result,
  canCreate,
  canEdit,
}: {
  result: PaginatedResult<Room>;
  canCreate: boolean;
  canEdit: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Add room"
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Room
              </Button>
            }
          >
            {(close) => <RoomForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {result.data.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No rooms yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 py-2 sm:grid-cols-3 lg:grid-cols-4">
              {result.data.map((room) => (
                <RoomCard key={room.id} room={room} canEdit={canEdit} />
              ))}
            </div>
          )}
          <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
        </TabsContent>

        <TabsContent value="table">
          <DataTableToolbar searchPlaceholder="Search rooms…" exportData={result.data} exportFilename="rooms.csv" />
          <DataTable columns={roomColumns} data={result.data} emptyTitle="No rooms yet" />
          <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
