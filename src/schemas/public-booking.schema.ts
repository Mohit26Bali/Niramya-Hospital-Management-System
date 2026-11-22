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
  firstName: z.string().trim().min(2, "First name must be at least 2 characters").max(60, "First name is too long"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters").max(60, "Last name is too long"),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number")
    .refine((v) => v.replace(/\D/g, "").length >= 7 && v.replace(/\D/g, "").length <= 15, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").max(120, "Email is too long").optional().or(z.literal("")),
  gender: publicBookingGenderEnum,
  dob: z.coerce
    .date({ message: "Date of birth is required" })
    .refine((date) => date < new Date(), "Date of birth must be in the past")
    .refine((date) => date.getFullYear() >= 1900, "Enter a valid date of birth"),
  departmentId: z.string().min(1, "Please select a department"),
  doctorId: z.string().min(1, "Please select a doctor"),
  preferredDateTime: z.coerce
    .date({ message: "Preferred date/time is required" })
    .refine((date) => date > new Date(), "Preferred date/time must be in the future"),
  appointmentType: appointmentTypeEnum,
  reason: z.string().trim().min(5, "Please briefly describe the reason for your visit").max(500, "Please keep the reason under 500 characters"),
  // A hidden field real visitors never see or fill. Scripts that fill every field give themselves away.
  website: z.string().max(200).optional(),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
export type PublicBookingFormValues = z.input<typeof publicBookingSchema>;
