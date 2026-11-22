"use server";

import bcrypt from "bcryptjs";
import { signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/password.schema";
import { hashPassword, passwordProblem } from "@/lib/password";
import { LoginThrottle } from "@/lib/rate-limit";
import { recordAudit } from "@/server/services/audit.service";

// Guessing the current password through this form counts like any other failed login.
const throttle = new LoginThrottle(5);

export async function changePasswordAction(input: ChangePasswordInput): Promise<{ error: string } | never> {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in again." };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  const { currentPassword, newPassword } = parsed.data;

  const key = session.user.id;
  if (throttle.isLocked(key)) return { error: "Too many wrong attempts. Try again in 15 minutes." };

  const user = await prisma.user.findUnique({ where: { id: key } });
  if (!user || !user.isActive) return { error: "This account is no longer active." };

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throttle.fail(key);
    return { error: "The current password is not correct." };
  }
  throttle.succeed(key);

  if (newPassword === currentPassword) return { error: "Choose a password different from the current one." };
  const problem = passwordProblem(newPassword, user.email);
  if (problem) return { error: problem };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(newPassword), mustChangePassword: false, passwordChangedAt: new Date() },
  });
  await recordAudit({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: "UPDATE",
    entity: "User",
    entityId: user.id,
    details: { change: "password" },
  });

  // Signing out everywhere simple: the person signs in again with the new password.
  await signOut({ redirectTo: "/login?changed=1" });
  return { error: "" };
}
