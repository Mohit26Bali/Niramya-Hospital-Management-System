"use server";

import { runAction } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import {
  invoiceSchema,
  recordPaymentSchema,
  type InvoiceInput,
  type RecordPaymentInput,
} from "@/schemas/invoice.schema";
import * as InvoiceService from "@/server/services/invoice.service";

export async function listInvoicesAction(searchParams: Record<string, string | string[] | undefined>) {
  await requirePermission("billing", "read");
  const params = parseSearchParams(searchParams);
  return InvoiceService.listInvoices(params);
}

export async function getInvoiceAction(id: string) {
  await requirePermission("billing", "read");
  return InvoiceService.getInvoiceById(id);
}

export async function createInvoiceAction(input: InvoiceInput) {
  return runAction(async () => {
    const session = await requirePermission("billing", "create");
    const data = invoiceSchema.parse(input);
    const invoice = await InvoiceService.createInvoice(data, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/billing");
    return invoice;
  });
}

export async function recordPaymentAction(id: string, input: RecordPaymentInput) {
  return runAction(async () => {
    const session = await requirePermission("billing", "update");
    const data = recordPaymentSchema.parse(input);
    await InvoiceService.recordPayment(id, data, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/billing");
    revalidatePath(`/dashboard/billing/${id}`);
  });
}

export async function deleteInvoiceAction(id: string) {
  return runAction(async () => {
    const session = await requirePermission("billing", "delete");
    await InvoiceService.deleteInvoice(id, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/billing");
  });
}
