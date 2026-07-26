import { z } from "zod";

export const appointmentStatusEnum = z.enum([
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  departmentId: z.string().min(1, "Department is required"),
  scheduledAt: z.coerce.date({ message: "Scheduled date/time is required" }),
  durationMins: z.coerce.number().int().min(5, "Duration must be at least 5 minutes").default(30),
  reason: z.string().min(2, "Reason is required"),
  notes: z.string().optional().or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type AppointmentFormValues = z.input<typeof appointmentSchema>;

export const appointmentStatusUpdateSchema = z.object({
  status: appointmentStatusEnum,
});

export type AppointmentStatusInput = z.infer<typeof appointmentStatusUpdateSchema>;
