import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listInvoicesAction } from "@/actions/invoice.actions";
import { PageHeader } from "@/components/shared/page-header";
import { InvoicesTable } from "@/components/billing/invoices-table";
import type { InvoiceRow } from "@/components/billing/invoice-columns";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listInvoicesAction(params)]);

  return (
    <div>
      <PageHeader title="Billing" description="Manage patient invoices and payments" />
      <InvoicesTable
        result={{ ...result, data: result.data as InvoiceRow[] }}
        canCreate={can(session?.user.role, "billing", "create")}
        canDelete={can(session?.user.role, "billing", "delete")}
      />
    </div>
  );
}
