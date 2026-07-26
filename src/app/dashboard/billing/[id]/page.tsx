import Image from "next/image";
import { notFound } from "next/navigation";
import { getInvoiceAction } from "@/actions/invoice.actions";
import { PrintButton } from "@/components/billing/print-button";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceAction(id);

  if (!invoice) {
    notFound();
  }

  const { patient, items } = invoice;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="rounded-xl border border-border bg-card p-8 shadow-sm print:border-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Niramaya" width={40} height={40} className="rounded-md" />
            <div>
              <p className="text-lg font-semibold text-foreground">Niramaya</p>
              <p className="text-xs text-muted-foreground">Hospital Management System</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground">Invoice {invoice.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">Issued {formatDateTime(invoice.issuedAt)}</p>
            <div className="mt-2">
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6">
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">Bill To</p>
            <p className="mt-1 font-medium text-foreground">
              {patient.firstName} {patient.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{patient.patientNumber}</p>
            <p className="text-sm text-muted-foreground">{patient.phone}</p>
            <p className="text-sm text-muted-foreground">
              {patient.address}, {patient.city}, {patient.state} {patient.pincode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase text-muted-foreground">Payment</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Method: {invoice.paymentMethod ?? "—"}
            </p>
            <p className="text-sm text-muted-foreground">
              Paid: {formatCurrency(Number(invoice.paidAmount))}
            </p>
            {invoice.paidAt ? (
              <p className="text-sm text-muted-foreground">Paid on {formatDateTime(invoice.paidAt)}</p>
            ) : null}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(Number(item.unitPrice))}</TableCell>
                <TableCell className="text-right">{formatCurrency(Number(item.total))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="ml-auto mt-6 w-full max-w-xs space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(Number(invoice.subtotal))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span className="font-medium">{formatCurrency(Number(invoice.tax))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="font-medium">- {formatCurrency(Number(invoice.discount))}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <span className="text-base font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(Number(invoice.totalAmount))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
