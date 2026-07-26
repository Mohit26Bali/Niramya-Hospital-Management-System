import { z } from "zod";

export const admissionStatusEnum = z.enum(["ADMITTED", "DISCHARGED", "TRANSFERRED"]);

export const admissionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  nurseId: z.string().optional().or(z.literal("")),
  roomId: z.string().min(1, "Room is required"),
  admittedBy: z.string().min(1, "Admitted by is required"),
  reason: z.string().min(2, "Reason is required"),
});

export type AdmissionInput = z.infer<typeof admissionSchema>;
export type AdmissionFormValues = z.input<typeof admissionSchema>;

export const dischargeAdmissionSchema = z.object({
  dischargeSummary: z.string().optional().or(z.literal("")),
});

export type DischargeAdmissionInput = z.infer<typeof dischargeAdmissionSchema>;

export const admissionStatusUpdateSchema = z.object({
  status: admissionStatusEnum,
});

export type AdmissionStatusInput = z.infer<typeof admissionStatusUpdateSchema>;
