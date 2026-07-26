"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/shared/data-table/data-table";
import { DataTableToolbar } from "@/components/shared/data-table/data-table-toolbar";
import { DataTablePagination } from "@/components/shared/data-table/data-table-pagination";
import { FormDialog } from "@/components/shared/form-dialog";
import { Button } from "@/components/ui/button";
import { buildInvoiceColumns, type InvoiceRow } from "@/components/billing/invoice-columns";
import { InvoiceForm } from "@/components/billing/invoice-form";
import type { PaginatedResult } from "@/lib/pagination";

export function InvoicesTable({
  result,
  canCreate,
  canDelete,
}: {
  result: PaginatedResult<InvoiceRow>;
  canCreate: boolean;
  canDelete: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const columns = buildInvoiceColumns(canDelete);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {canCreate ? (
          <FormDialog
            title="Create invoice"
            open={createOpen}
            onOpenChange={setCreateOpen}
            className="sm:max-w-2xl"
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" /> Add Invoice
              </Button>
            }
          >
            {(close) => <InvoiceForm onSuccess={() => { close(); setCreateOpen(false); }} />}
          </FormDialog>
        ) : null}
      </div>

      <DataTableToolbar searchPlaceholder="Search invoices…" exportData={result.data} exportFilename="invoices.csv" />
      <DataTable columns={columns} data={result.data} emptyTitle="No invoices yet" />
      <DataTablePagination page={result.page} pageCount={result.pageCount} total={result.total} pageSize={result.pageSize} />
    </div>
  );
}
