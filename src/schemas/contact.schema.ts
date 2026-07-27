import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Enter a valid email address"),
  phone: z.string().min(6, "Enter a valid phone number"),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type ContactFormValues = z.input<typeof contactSchema>;
