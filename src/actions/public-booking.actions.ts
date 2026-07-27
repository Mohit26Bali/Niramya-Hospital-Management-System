"use server";

import { z } from "zod";
import { publicBookingSchema, type PublicBookingInput } from "@/schemas/public-booking.schema";
import { createPublicBooking } from "@/server/services/public-booking.service";

// NOTE: intentionally no requirePermission() call here — this is the one
// legitimate unauthenticated write path in the app. Anyone visiting the
// public site can submit a booking request.
export async function submitPublicBookingAction(
  input: PublicBookingInput
): Promise<
  | { success: true; appointmentNumber: string; patientNumber: string }
  | { success: false; error: string }
> {
  try {
    const data = publicBookingSchema.parse(input);
    const result = await createPublicBooking(data);
    return { success: true, ...result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Please check the form and try again.",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong. Please try again.",
    };
  }
}
