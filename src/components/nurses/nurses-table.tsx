"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { nurseColumns, type NurseRow } from "@/components/nurses/nurse-columns";
import { NurseForm } from "@/components/nurses/nurse-form";
import type { PaginatedResult } from "@/lib/pagination";

export function NursesTable({
  result,
  canCreate,
}: {
  result: PaginatedResult<NurseRow>;
  canCreate: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Add nurse"
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Nurse
              </Button>
            }
          >
            {(close) => <NurseForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <DataTableToolbar searchPlaceholder="Search nurses…" exportData={result.data} exportFilename="nurses.csv" />
      <DataTable columns={nurseColumns} data={result.data} emptyTitle="No nurses yet" />
      <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
    </div>
  );
}
