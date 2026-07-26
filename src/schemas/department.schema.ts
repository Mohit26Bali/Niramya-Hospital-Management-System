import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  floor: z.coerce.number().int().min(0, "Floor must be 0 or higher"),
  phone: z.string().min(6, "Enter a valid phone number"),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type DepartmentFormValues = z.input<typeof departmentSchema>;
