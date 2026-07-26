"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { doctorColumns, type DoctorRow } from "@/components/doctors/doctor-columns";
import { DoctorForm } from "@/components/doctors/doctor-form";
import type { PaginatedResult } from "@/lib/pagination";

export function DoctorsTable({
  result,
  canCreate,
}: {
  result: PaginatedResult<DoctorRow>;
  canCreate: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Add doctor"
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Doctor
              </Button>
            }
          >
            {(close) => <DoctorForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <DataTableToolbar searchPlaceholder="Search doctors…" exportData={result.data} exportFilename="doctors.csv" />
      <DataTable columns={doctorColumns} data={result.data} emptyTitle="No doctors yet" />
      <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
    </div>
  );
}
