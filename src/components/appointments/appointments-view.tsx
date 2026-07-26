"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/shared/form-dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { appointmentColumns, type AppointmentRow } from "@/components/appointments/appointment-columns";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import type { PaginatedResult } from "@/lib/pagination";

export function AppointmentsView({
  result,
  canCreate,
}: {
  result: PaginatedResult<AppointmentRow>;
  canCreate: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Tabs defaultValue="table">
      <div className="mb-4 flex items-center justify-between gap-4">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {canCreate ? (
          <FormDialog
            title="Add appointment"
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Appointment
              </Button>
            }
          >
            {(close) => <AppointmentForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <TabsContent value="table">
        <DataTableToolbar
          searchPlaceholder="Search appointments…"
          exportData={result.data}
          exportFilename="appointments.csv"
        />
        <DataTable columns={appointmentColumns} data={result.data} emptyTitle="No appointments yet" />
        <DataTablePagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
          pageSize={result.pageSize}
        />
      </TabsContent>

      <TabsContent value="calendar">
        <AppointmentCalendar />
      </TabsContent>
    </Tabs>
  );
}
