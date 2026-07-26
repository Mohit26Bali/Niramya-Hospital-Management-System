import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    doctorId: string | null;
    nurseId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      doctorId: string | null;
      nurseId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    doctorId: string | null;
    nurseId: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    doctorId: string | null;
    nurseId: string | null;
  }
}
