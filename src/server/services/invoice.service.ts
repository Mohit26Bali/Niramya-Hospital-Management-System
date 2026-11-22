import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { InvoiceInput, RecordPaymentInput } from "@/schemas/invoice.schema";
import { recordAudit } from "@/server/services/audit.service";
import { nextNumber } from "@/lib/sequence";
import { UserError } from "@/lib/action-result";
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

/** Money is added up in whole paise (integers). Adding rupee floats gives totals such as 100.30000000000001. */
const toPaise = (rupees: number) => Math.round(rupees * 100);
const toRupees = (paise: number) => paise / 100;

export async function createInvoice(input: InvoiceInput, actor: Actor) {
  const patient = await prisma.patient.findUnique({ where: { id: input.patientId }, select: { isActive: true } });
  if (!patient || !patient.isActive) throw new UserError("That patient could not be found.");

  const itemsWithTotals = input.items.map((item) => ({
    description: item.description,
    category: item.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: toRupees(item.quantity * toPaise(item.unitPrice)),
  }));

  const subtotalPaise = input.items.reduce((sum, item) => sum + item.quantity * toPaise(item.unitPrice), 0);
  const totalPaise = subtotalPaise + toPaise(input.tax) - toPaise(input.discount);
  if (totalPaise < 0) throw new UserError("The discount cannot be larger than the bill (items plus tax).");
  if (totalPaise > 9_999_999_99) throw new UserError("That amount is too large for one invoice.");
  const subtotal = toRupees(subtotalPaise);
  const totalAmount = toRupees(totalPaise);

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: await nextNumber("INV"),
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

/** paidAmount is the TOTAL received so far. It may only go up, and never above the amount due. */
export async function recordPayment(id: string, input: RecordPaymentInput, actor: Actor) {
  const invoice = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"invoice:" + id}))`;
    const existing = await tx.invoice.findUnique({ where: { id } });
    if (!existing) throw new UserError("That invoice no longer exists.");
    if (existing.status === "CANCELLED") throw new UserError("A cancelled invoice cannot take payments.");

    const total = toPaise(Number(existing.totalAmount));
    const before = toPaise(Number(existing.paidAmount));
    const now = toPaise(input.paidAmount);
    if (now > total) throw new UserError("The amount paid cannot be more than the amount due.");
    if (now < before) throw new UserError("The total paid cannot go down. Payments already recorded stay recorded.");
    if (now === before) throw new UserError("No new payment to record.");

    const fullyPaid = now >= total;
    return tx.invoice.update({
      where: { id },
      data: {
        paidAmount: toRupees(now),
        paymentMethod: input.paymentMethod,
        status: fullyPaid ? "PAID" : "PARTIALLY_PAID",
        paidAt: fullyPaid ? new Date() : null,
      },
    });
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
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) throw new UserError("That invoice no longer exists.");
  // A bill that took money is a financial record: it is not erased.
  if (Number(existing.paidAmount) > 0) throw new UserError("This invoice has payments recorded, so it cannot be deleted.");
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
