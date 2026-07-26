import { z } from "zod";

export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

export const doctorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: genderEnum,
  specialization: z.string().min(2, "Specialization is required"),
  phone: z.string().min(6, "Enter a valid phone number"),
  qualification: z.string().min(2, "Qualification is required"),
  yearsExperience: z.coerce.number().int().min(0, "Years of experience must be 0 or higher"),
  consultationFee: z.coerce.number().min(0, "Consultation fee must be 0 or higher"),
  departmentId: z.string().min(1, "Department is required"),
  isAvailable: z.boolean(),
});

export type DoctorInput = z.infer<typeof doctorSchema>;
export type DoctorFormValues = z.input<typeof doctorSchema>;

export const doctorCreateSchema = doctorSchema.extend({
  email: z.string().email("Enter a valid email address"),
});

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;
export type DoctorCreateFormValues = z.input<typeof doctorCreateSchema>;
