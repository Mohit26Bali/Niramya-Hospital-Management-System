"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn, loginThrottleByAddress, loginThrottleByAccount } from "@/lib/auth";
import { clientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/schemas/auth.schema";

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Tell a locked-out person why, instead of "wrong password" for a password that may well be right.
  const email = parsed.data.email.trim().toLowerCase();
  const ip = clientIp(await headers());
  if (loginThrottleByAddress.isLocked(`${email}|${ip}`) || loginThrottleByAccount.isLocked(email)) {
    return { error: "Too many failed attempts. Please wait 15 minutes and try again." };
  }

  // Only a path inside this site is accepted as the place to go next (no open redirect to another website).
  const callback = String(formData.get("callbackUrl") ?? "");
  const redirectTo = callback.startsWith("/") && !callback.startsWith("//") && !callback.includes("\\") ? callback : "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Invalid email or password" };
      }
      return { error: "Something went wrong. Please try again." };
    }
    throw error;
  }
}
