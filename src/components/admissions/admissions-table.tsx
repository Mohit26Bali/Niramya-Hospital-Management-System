"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { buildAdmissionColumns, type AdmissionRow } from "@/components/admissions/admission-columns";
import { AdmissionForm } from "@/components/admissions/admission-form";
import type { PaginatedResult } from "@/lib/pagination";

export function AdmissionsTable({
  result,
  canCreate,
  canDelete,
  defaultAdmittedBy,
}: {
  result: PaginatedResult<AdmissionRow>;
  canCreate: boolean;
  canDelete: boolean;
  defaultAdmittedBy: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const columns = useMemo(() => buildAdmissionColumns(canDelete), [canDelete]);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Admit patient"
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Admit Patient
              </Button>
            }
          >
            {(close) => (
              <AdmissionForm
                defaultAdmittedBy={defaultAdmittedBy}
                onSuccess={() => {
                  close();
                  setCreateOpen(false);
                }}
              />
            )}
          </FormDialog>
        ) : null}
      </div>

      <DataTableToolbar
        searchPlaceholder="Search admissions…"
        exportData={result.data}
        exportFilename="admissions.csv"
      />
      <DataTable columns={columns} data={result.data} emptyTitle="No admissions yet" />
      <DataTablePagination
        page={result.page}
        pageCount={result.pageCount}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
