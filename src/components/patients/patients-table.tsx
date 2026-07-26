"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Patient } from "@prisma/client";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { patientColumns } from "@/components/patients/patient-columns";
import { PatientForm } from "@/components/patients/patient-form";
import type { PaginatedResult } from "@/lib/pagination";

export function PatientsTable({
  result,
  canCreate,
}: {
  result: PaginatedResult<Patient>;
  canCreate: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Register patient"
            open={createOpen}
            onOpenChange={setCreateOpen}
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Patient
              </Button>
            }
          >
            {(close) => <PatientForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <DataTableToolbar searchPlaceholder="Search patients…" exportData={result.data} exportFilename="patients.csv" />
      <DataTable columns={patientColumns} data={result.data} emptyTitle="No patients yet" />
      <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
    </div>
  );
}
