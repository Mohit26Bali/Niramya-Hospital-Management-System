import { z } from "zod";

export const hospitalProfileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  tagline: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
});

export type HospitalProfileInput = z.infer<typeof hospitalProfileSchema>;
