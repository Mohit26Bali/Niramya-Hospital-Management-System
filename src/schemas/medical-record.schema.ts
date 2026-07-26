import { z } from "zod";

export const medicalRecordSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  chiefComplaint: z.string().min(2, "Chief complaint is required"),
  symptoms: z.string().optional().or(z.literal("")),
  diagnosis: z.string().min(2, "Diagnosis is required"),
  allergies: z.string().optional().or(z.literal("")),
  treatmentPlan: z.string().optional().or(z.literal("")),
  doctorNotes: z.string().optional().or(z.literal("")),
});

export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>;
export type MedicalRecordFormValues = z.input<typeof medicalRecordSchema>;

export const vitalsSchema = z.object({
  // z.literal("") is listed first in each union so an empty input field short-circuits
  // before z.coerce.number() runs — otherwise Number("") === 0 would pass min(0) checks
  // and silently save vitals as 0 instead of leaving them blank.
  temperatureC: z.union([z.literal(""), z.coerce.number().min(20).max(50)]).optional(),
  bloodPressure: z.string().optional().or(z.literal("")),
  heartRateBpm: z.union([z.literal(""), z.coerce.number().int().min(0).max(400)]).optional(),
  respiratoryRate: z.union([z.literal(""), z.coerce.number().int().min(0).max(200)]).optional(),
  spo2: z.union([z.literal(""), z.coerce.number().int().min(0).max(100)]).optional(),
  weightKg: z.union([z.literal(""), z.coerce.number().min(0).max(500)]).optional(),
  heightCm: z.union([z.literal(""), z.coerce.number().min(0).max(300)]).optional(),
  nurseNotes: z.string().optional().or(z.literal("")),
});

export type VitalsInput = z.infer<typeof vitalsSchema>;
export type VitalsFormValues = z.input<typeof vitalsSchema>;
