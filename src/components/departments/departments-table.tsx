"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Department } from "@prisma/client";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { departmentColumns } from "@/components/departments/department-columns";
import { DepartmentForm } from "@/components/departments/department-form";
import type { PaginatedResult } from "@/lib/pagination";

type DepartmentRow = Department & { _count: { doctors: number; nurses: number } };

export function DepartmentsTable({
  result,
  canCreate,
}: {
  result: PaginatedResult<DepartmentRow>;
  canCreate: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Add department"
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Department
              </Button>
            }
          >
            {(close) => <DepartmentForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <DataTableToolbar searchPlaceholder="Search departments…" exportData={result.data} exportFilename="departments.csv" />
      <DataTable columns={departmentColumns} data={result.data} emptyTitle="No departments yet" />
      <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
    </div>
  );
}
