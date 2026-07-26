import { z } from "zod";

export const genderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

export const bloodGroupEnum = z.enum([
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
]);

export const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: genderEnum,
  dob: z.coerce.date({ message: "Date of birth is required" }),
  bloodGroup: bloodGroupEnum.optional().nullable(),
  phone: z.string().min(6, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(1, "Pincode is required"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(6, "Enter a valid phone number"),
  insuranceProvider: z.string().optional().or(z.literal("")),
  insuranceNumber: z.string().optional().or(z.literal("")),
  allergies: z.string().optional().or(z.literal("")),
  chronicConditions: z.string().optional().or(z.literal("")),
});

export type PatientInput = z.infer<typeof patientSchema>;
export type PatientFormValues = z.input<typeof patientSchema>;
