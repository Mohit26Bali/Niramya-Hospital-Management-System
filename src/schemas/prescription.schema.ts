import { z } from "zod";

export const prescriptionItemSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  durationDays: z.coerce.number().int().min(1, "Duration must be at least 1 day"),
  instructions: z.string().optional().or(z.literal("")),
});

export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
export type PrescriptionItemFormValues = z.input<typeof prescriptionItemSchema>;

export const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(prescriptionItemSchema).min(1, "Add at least one medication"),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
export type PrescriptionFormValues = z.input<typeof prescriptionSchema>;
