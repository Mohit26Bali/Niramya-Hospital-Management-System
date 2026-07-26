"use client";

import { useState } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Invoice, Patient } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { RowActions } from "@/components/shared/data-table/row-actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormDialog } from "@/components/shared/form-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteInvoiceAction } from "@/actions/invoice.actions";
import { RecordPaymentForm } from "@/components/billing/record-payment-form";
import { formatCurrency, formatDate } from "@/lib/utils";

export type InvoiceRow = Invoice & { patient: Patient };

function ActionsCell({ invoice, canDelete }: { invoice: InvoiceRow; canDelete: boolean }) {
  const [paymentOpen, setPaymentOpen] = useState(false);

  return (
    <>
      <RowActions>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/billing/${invoice.id}`}>
            <Eye className="mr-2 size-3.5" /> View / Print
          </Link>
        </DropdownMenuItem>
        {invoice.status !== "PAID" && invoice.status !== "CANCELLED" ? (
          <DropdownMenuItem onSelect={() => setPaymentOpen(true)}>
            <CreditCard className="mr-2 size-3.5" /> Record Payment
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <ConfirmDialog
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 className="mr-2 size-3.5" /> Delete
              </DropdownMenuItem>
            }
            title="Delete invoice?"
            description={`Invoice "${invoice.invoiceNumber}" will be permanently deleted.`}
            onConfirm={async () => {
              await deleteInvoiceAction(invoice.id);
              toast.success("Invoice deleted");
            }}
          />
        ) : null}
      </RowActions>

      <FormDialog title="Record payment" open={paymentOpen} onOpenChange={setPaymentOpen}>
        {(close) => (
          <RecordPaymentForm
            invoice={invoice}
            onSuccess={() => {
              close();
              setPaymentOpen(false);
            }}
          />
        )}
      </FormDialog>
    </>
  );
}

export function buildInvoiceColumns(canDelete: boolean): ColumnDef<InvoiceRow>[] {
  return [
    {
      accessorKey: "invoiceNumber",
      header: () => <DataTableColumnHeader title="Invoice #" sortKey="invoiceNumber" />,
      cell: ({ row }) => (
        <Link href={`/dashboard/billing/${row.original.id}`} className="font-medium text-foreground hover:underline">
          {row.original.invoiceNumber}
        </Link>
      ),
    },
    {
      id: "patient",
      header: "Patient",
      cell: ({ row }) => `${row.original.patient.firstName} ${row.original.patient.lastName}`,
    },
    {
      accessorKey: "totalAmount",
      header: () => <DataTableColumnHeader title="Total" sortKey="totalAmount" />,
      cell: ({ row }) => formatCurrency(Number(row.original.totalAmount)),
    },
    {
      accessorKey: "paidAmount",
      header: "Paid",
      cell: ({ row }) => formatCurrency(Number(row.original.paidAmount)),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "issuedAt",
      header: () => <DataTableColumnHeader title="Issued" sortKey="issuedAt" />,
      cell: ({ row }) => formatDate(row.original.issuedAt),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <ActionsCell invoice={row.original} canDelete={canDelete} />,
    },
  ];
}
