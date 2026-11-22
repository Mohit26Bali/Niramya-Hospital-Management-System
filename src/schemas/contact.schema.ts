import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100, "Name is too long"),
  email: z.email("Enter a valid email address").max(120, "Email is too long"),
  phone: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number"),
  subject: z.string().trim().min(2, "Subject is required").max(150, "Subject is too long"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Please keep the message under 2000 characters"),
  // Hidden field that only scripts fill in.
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactFormValues = z.input<typeof contactSchema>;
