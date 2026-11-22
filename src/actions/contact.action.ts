"use server";

import { headers } from "next/headers";
import { contactSchema, type ContactInput } from "@/schemas/contact.schema";
import { createContactMessage } from "@/server/services/contact.service";
import { RateLimiter, clientIp } from "@/lib/rate-limit";

// 3 messages per visitor address per hour: enough for a real person, not enough to flood the inbox.
const limiter = new RateLimiter(3, 60 * 60_000);

export async function submitContactMessageAction(
  values: ContactInput
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };

  if (!limiter.allow(clientIp(await headers()))) {
    return { success: false, error: "You have sent several messages already. Please try again later, or call us." };
  }
  // A filled-in hidden field means a script: say thanks and store nothing.
  if (parsed.data.website) return { success: true };

  try {
    await createContactMessage(parsed.data);
    return { success: true };
  } catch (error) {
    console.error("[contact] could not store message:", error);
    return { success: false, error: "We could not save your message right now. Please call us instead." };
  }
}
