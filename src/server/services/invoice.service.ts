import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { InvoiceInput, RecordPaymentInput } from "@/schemas/invoice.schema";
import { recordAudit } from "@/server/services/audit.service";
import { generateSequenceNumber } from "@/lib/utils";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

export async function listInvoices(params: PaginationParams) {
  const where = {
    ...(params.search
      ? {
          OR: [
            { invoiceNumber: { contains: params.search, mode: "insensitive" as const } },
            {
              patient: {
                is: {
                  OR: [
                    { firstName: { contains: params.search, mode: "insensitive" as const } },
                    { lastName: { contains: params.search, mode: "insensitive" as const } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { issuedAt: "desc" },
      include: { patient: true, items: true },
    }),
    prisma.invoice.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { patient: true, items: true },
  });
}

export async function createInvoice(input: InvoiceInput, actor: Actor) {
  const count = await prisma.invoice.count();
  const invoiceNumber = generateSequenceNumber("INV", count + 1);

  const itemsWithTotals = input.items.map((item) => ({
    description: item.description,
    category: item.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));

  const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal + input.tax - input.discount;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      patientId: input.patientId,
      subtotal,
      tax: input.tax,
      discount: input.discount,
      totalAmount,
      items: {
        create: itemsWithTotals,
      },
    },
    include: { patient: true, items: true },
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Invoice",
    entityId: invoice.id,
    details: { invoiceNumber: invoice.invoiceNumber, totalAmount },
  });

  return invoice;
}

export async function recordPayment(id: string, input: RecordPaymentInput, actor: Actor) {
  const existing = await prisma.invoice.findUniqueOrThrow({ where: { id } });
  const isFullyPaid = input.paidAmount >= Number(existing.totalAmount);

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      paidAmount: input.paidAmount,
      paymentMethod: input.paymentMethod,
      status: isFullyPaid ? "PAID" : "PARTIALLY_PAID",
      paidAt: isFullyPaid ? new Date() : null,
    },
  });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Invoice",
    entityId: invoice.id,
    details: { invoiceNumber: invoice.invoiceNumber, paidAmount: input.paidAmount, status: invoice.status },
  });

  return invoice;
}

export async function deleteInvoice(id: string, actor: Actor) {
  const invoice = await prisma.invoice.delete({ where: { id } });

  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "Invoice",
    entityId: invoice.id,
    details: { invoiceNumber: invoice.invoiceNumber },
  });

  return invoice;
}
