import { z } from "zod";

export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
export const shiftEnum = z.enum(["MORNING", "EVENING", "NIGHT"]);

export const nurseSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: genderEnum,
  phone: z.string().min(6, "Enter a valid phone number"),
  departmentId: z.string().optional().or(z.literal("")),
  shift: shiftEnum,
});

export type NurseInput = z.infer<typeof nurseSchema>;
export type NurseFormValues = z.input<typeof nurseSchema>;

export const nurseCreateSchema = nurseSchema.extend({
  email: z.string().email("Enter a valid email address"),
});

export type NurseCreateInput = z.infer<typeof nurseCreateSchema>;
export type NurseCreateFormValues = z.input<typeof nurseCreateSchema>;
