import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

type Action = "create" | "read" | "update" | "delete" | "updateVitals" | "updateAdmissionStatus";

const ALL_ROLES: Role[] = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];

export const PERMISSIONS = {
  department: {
    create: ["ADMIN"],
    update: ["ADMIN"],
    delete: ["ADMIN"],
  },
  doctor: {
    create: ["ADMIN"],
    update: ["ADMIN"],
    delete: ["ADMIN"],
  },
  nurse: {
    create: ["ADMIN"],
    update: ["ADMIN"],
    delete: ["ADMIN"],
  },
  room: {
    create: ["ADMIN"],
    update: ["ADMIN", "RECEPTIONIST"],
    delete: ["ADMIN"],
  },
  patient: {
    create: ["ADMIN", "RECEPTIONIST"],
    update: ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"],
    delete: ["ADMIN"],
  },
  appointment: {
    create: ["ADMIN", "RECEPTIONIST"],
    update: ["ADMIN", "RECEPTIONIST", "DOCTOR"],
    delete: ["ADMIN", "RECEPTIONIST"],
  },
  admission: {
    create: ["ADMIN", "RECEPTIONIST"],
    update: ["ADMIN", "RECEPTIONIST"],
    updateAdmissionStatus: ["ADMIN", "RECEPTIONIST", "NURSE"],
    delete: ["ADMIN"],
  },
  medicalRecord: {
    create: ["ADMIN", "DOCTOR"],
    update: ["ADMIN", "DOCTOR"],
    updateVitals: ["ADMIN", "DOCTOR", "NURSE"],
    delete: ["ADMIN"],
  },
  prescription: {
    create: ["ADMIN", "DOCTOR"],
    update: ["ADMIN", "DOCTOR"],
    delete: ["ADMIN"],
  },
  billing: {
    create: ["ADMIN", "RECEPTIONIST"],
    update: ["ADMIN", "RECEPTIONIST"],
    delete: ["ADMIN"],
  },
  settings: {
    update: ["ADMIN"],
  },
} satisfies Record<string, Partial<Record<Action, Role[]>>>;

export type Resource = keyof typeof PERMISSIONS;

export function can(role: Role | undefined, resource: Resource, action: Action): boolean {
  if (!role) return false;
  const allowed = (PERMISSIONS[resource] as Partial<Record<Action, Role[]>>)[action];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function canRead(role: Role | undefined): boolean {
  return !!role && ALL_ROLES.includes(role);
}

export async function requirePermission(resource: Resource, action: Action) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized: not signed in");
  if (!can(session.user.role, resource, action)) {
    throw new Error(`Forbidden: ${session.user.role} cannot ${action} ${resource}`);
  }
  return session;
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized: not signed in");
  return session;
}
