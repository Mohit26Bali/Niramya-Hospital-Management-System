"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { publicBookingSchema, type PublicBookingInput } from "@/schemas/public-booking.schema";
import { createPublicBooking } from "@/server/services/public-booking.service";
import { UserError } from "@/lib/action-result";
import { RateLimiter, clientIp } from "@/lib/rate-limit";

// Per visitor address: 5 requests in 15 minutes. Per phone number: 3 a day. In memory, so a brake on one server.
const byAddress = new RateLimiter(5, 15 * 60_000);
const byPhone = new RateLimiter(3, 24 * 60 * 60_000);

export type PublicBookingResult =
  | { success: true; appointmentNumber: string }
  | { success: false; error: string };

// NOTE: intentionally no requirePermission() call here. This is one of the few writes open to anonymous
// visitors, which is why it is rate limited, validated tightly, and reveals nothing about existing patients.
export async function submitPublicBookingAction(input: PublicBookingInput): Promise<PublicBookingResult> {
  try {
    const ip = clientIp(await headers());
    if (!byAddress.allow(ip)) {
      return { success: false, error: "Too many requests from this device. Please try again in a few minutes, or call us." };
    }

    const data = publicBookingSchema.parse(input);

    // A filled-in honeypot means a script, not a person. Answer as if it worked so the script learns nothing.
    if (data.website) return { success: true, appointmentNumber: "APT-000000" };

    if (!byPhone.allow(data.phone.replace(/\D/g, ""))) {
      return { success: false, error: "This phone number has reached today's booking limit. Please call the hospital." };
    }

    const result = await createPublicBooking(data);
    return { success: true, ...result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message ?? "Please check the form and try again." };
    }
    if (error instanceof UserError) return { success: false, error: error.message };
    // Anything else is a fault on our side. Log it; tell the visitor nothing about how it failed.
    console.error("[public booking] failed:", error);
    return { success: false, error: "We could not save your request right now. Please try again or call the hospital." };
  }
}
