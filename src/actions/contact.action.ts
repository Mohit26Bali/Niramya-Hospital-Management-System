"use server";

import { contactSchema, type ContactInput } from "@/schemas/contact.schema";

/**
 * Public "Contact Us" form submission handler.
 * This is intentionally NOT persisted to the database — no ContactMessage
 * model exists. It validates the payload and logs it server-side so the
 * public marketing site has a working contact flow without touching the
 * staff-facing data model.
 */
export async function submitContactMessageAction(values: ContactInput) {
  const parsed = contactSchema.parse(values);
  console.log("[public/contact] New contact message:", parsed);
  return { success: true as const };
}
