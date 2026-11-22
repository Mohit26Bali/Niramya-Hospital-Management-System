import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/server/services/audit.service";
import { DUMMY_HASH } from "@/lib/password";
import { LoginThrottle, clientIp } from "@/lib/rate-limit";

/** A staff session lasts one working shift, not a month: a stolen or forgotten browser stops working the same day. */
export const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

// Five wrong passwords from one address lock that address out of that account for 15 minutes; twenty from
// anywhere lock the account itself, so one attacker cannot cheaply lock a real user out with five guesses.
export const loginThrottleByAddress = new LoginThrottle(5);
export const loginThrottleByAccount = new LoginThrottle(20);

export type LoginDecision = "ok" | "locked" | "invalid";

/** The password check, separated from Auth.js so it can be tested directly. */
export async function verifyCredentials(
  rawEmail: unknown,
  rawPassword: unknown,
  ip = "unknown"
): Promise<{ decision: LoginDecision; user?: Awaited<ReturnType<typeof loadUser>> }> {
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (!email || !password || email.length > 254 || password.length > 200) return { decision: "invalid" };

  const addressKey = `${email}|${ip}`;
  if (loginThrottleByAddress.isLocked(addressKey) || loginThrottleByAccount.isLocked(email)) {
    return { decision: "locked" };
  }

  const user = await loadUser(email);
  // Always run one bcrypt comparison, even for an unknown email, so response time does not reveal which
  // emails have accounts.
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !user.isActive || !valid) {
    loginThrottleByAddress.fail(addressKey);
    loginThrottleByAccount.fail(email);
    console.warn(`[auth] failed login for ${email.slice(0, 3)}*** from ${ip}`);
    return { decision: "invalid" };
  }

  loginThrottleByAddress.succeed(addressKey);
  loginThrottleByAccount.succeed(email);
  return { decision: "ok", user };
}

async function loadUser(email: string) {
  return prisma.user.findUnique({ where: { email }, include: { doctor: true, nurse: true } });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, request) => {
        const ip = request?.headers ? clientIp(request.headers) : "unknown";
        const { decision, user } = await verifyCredentials(credentials?.email, credentials?.password, ip);
        if (decision !== "ok" || !user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          doctorId: user.doctor?.id ?? null,
          nurseId: user.nurse?.id ?? null,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.doctorId = user.doctorId;
        token.nurseId = user.nurseId;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    session: ({ session, token }) => {
      const t = token as typeof token & {
        id: string;
        role: import("@prisma/client").Role;
        doctorId: string | null;
        nurseId: string | null;
        mustChangePassword?: boolean;
      };
      session.user.id = t.id;
      session.user.role = t.role;
      session.user.doctorId = t.doctorId;
      session.user.nurseId = t.nurseId;
      session.user.mustChangePassword = !!t.mustChangePassword;
      return session;
    },
  },
  events: {
    signIn: async ({ user }) => {
      if (!user.id) return;
      await recordAudit({
        userId: user.id,
        userName: user.name ?? user.email ?? "Unknown",
        userRole: user.role,
        action: "LOGIN",
        entity: "User",
        entityId: user.id,
      });
    },
  },
});
