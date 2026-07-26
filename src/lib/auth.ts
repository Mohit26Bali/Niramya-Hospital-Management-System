import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/server/services/audit.service";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { doctor: true, nurse: true },
        });
        if (!user || !user.isActive) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          doctorId: user.doctor?.id ?? null,
          nurseId: user.nurse?.id ?? null,
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
      }
      return token;
    },
    session: ({ session, token }) => {
      const t = token as typeof token & {
        id: string;
        role: import("@prisma/client").Role;
        doctorId: string | null;
        nurseId: string | null;
      };
      session.user.id = t.id;
      session.user.role = t.role;
      session.user.doctorId = t.doctorId;
      session.user.nurseId = t.nurseId;
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
