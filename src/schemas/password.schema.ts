import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(1, "Enter a new password").max(72, "Use at most 72 characters"),
    confirmPassword: z.string().min(1, "Repeat the new password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "The two new passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
