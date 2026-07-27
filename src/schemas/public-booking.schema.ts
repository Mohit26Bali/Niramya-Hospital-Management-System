import { z } from "zod";

export const publicBookingGenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

export const appointmentTypeEnum = z.enum([
  "CONSULTATION",
  "FOLLOW_UP",
  "HEALTH_CHECKUP",
  "EMERGENCY_REFERRAL",
]);

export const APPOINTMENT_TYPE_LABELS: Record<z.infer<typeof appointmentTypeEnum>, string> = {
  CONSULTATION: "Consultation",
  FOLLOW_UP: "Follow-up",
  HEALTH_CHECKUP: "Health Checkup",
  EMERGENCY_REFERRAL: "Emergency Referral",
};

export const publicBookingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z
    .string()
    .min(6, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  gender: publicBookingGenderEnum,
  dob: z.coerce
    .date({ message: "Date of birth is required" })
    .refine((date) => date < new Date(), "Date of birth must be in the past"),
  departmentId: z.string().min(1, "Please select a department"),
  doctorId: z.string().min(1, "Please select a doctor"),
  preferredDateTime: z.coerce
    .date({ message: "Preferred date/time is required" })
    .refine((date) => date > new Date(), "Preferred date/time must be in the future"),
  appointmentType: appointmentTypeEnum,
  reason: z.string().min(5, "Please briefly describe the reason for your visit"),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
export type PublicBookingFormValues = z.input<typeof publicBookingSchema>;
