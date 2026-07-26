"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import {
  getPrescriptionColumns,
  type PrescriptionRow,
} from "@/components/prescriptions/prescription-columns";
import { PrescriptionForm } from "@/components/prescriptions/prescription-form";
import type { PaginatedResult } from "@/lib/pagination";

export function PrescriptionsTable({
  result,
  canCreate,
  canDelete,
}: {
  result: PaginatedResult<PrescriptionRow>;
  canCreate: boolean;
  canDelete: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const columns = useMemo(() => getPrescriptionColumns({ canDelete }), [canDelete]);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Add prescription"
            open={createOpen}
            onOpenChange={setCreateOpen}
            className="sm:max-w-2xl"
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Prescription
              </Button>
            }
          >
            {(close) => <PrescriptionForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <DataTableToolbar
        searchPlaceholder="Search prescriptions…"
        exportData={result.data}
        exportFilename="prescriptions.csv"
      />
      <DataTable columns={columns} data={result.data} emptyTitle="No prescriptions yet" />
      <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
    </div>
  );
}
