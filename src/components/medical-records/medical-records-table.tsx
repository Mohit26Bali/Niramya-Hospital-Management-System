"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import {
  getMedicalRecordColumns,
  type MedicalRecordRow,
} from "@/components/medical-records/medical-record-columns";
import { MedicalRecordForm } from "@/components/medical-records/medical-record-form";
import type { PaginatedResult } from "@/lib/pagination";

export function MedicalRecordsTable({
  result,
  canCreate,
  canEdit,
  canDelete,
  canUpdateVitals,
}: {
  result: PaginatedResult<MedicalRecordRow>;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canUpdateVitals: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const columns = useMemo(
    () => getMedicalRecordColumns({ canEdit, canDelete, canUpdateVitals }),
    [canEdit, canDelete, canUpdateVitals]
  );

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Add medical record"
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Medical Record
              </Button>
            }
          >
            {(close) => <MedicalRecordForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <DataTableToolbar
        searchPlaceholder="Search medical records…"
        exportData={result.data}
        exportFilename="medical-records.csv"
      />
      <DataTable columns={columns} data={result.data} emptyTitle="No medical records yet" />
      <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
    </div>
  );
}
