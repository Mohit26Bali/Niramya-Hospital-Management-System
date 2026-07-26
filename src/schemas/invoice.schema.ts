import { z } from "zod";

export const invoiceItemCategoryValues = [
  "CONSULTATION",
  "ROOM_CHARGE",
  "MEDICINE",
  "LAB",
  "OTHER",
] as const;

export const paymentMethodValues = ["CASH", "CARD", "UPI", "INSURANCE"] as const;

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  category: z.enum(invoiceItemCategoryValues, { message: "Select a category" }),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or higher"),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceItemFormValues = z.input<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
  tax: z.coerce.number().min(0, "Tax must be 0 or higher").default(0),
  discount: z.coerce.number().min(0, "Discount must be 0 or higher").default(0),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceFormValues = z.input<typeof invoiceSchema>;

export const recordPaymentSchema = z.object({
  paidAmount: z.coerce.number().min(0, "Amount must be 0 or higher"),
  paymentMethod: z.enum(paymentMethodValues, { message: "Select a payment method" }),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type RecordPaymentFormValues = z.input<typeof recordPaymentSchema>;
