import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserError } from "@/lib/action-result";

type Action = "create" | "read" | "update" | "delete" | "updateVitals" | "updateAdmissionStatus";

const ALL_ROLES: Role[] = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];
const CLINICAL: Role[] = ["ADMIN", "DOCTOR", "NURSE"]; // people who treat patients
const FRONT_DESK: Role[] = ["ADMIN", "RECEPTIONIST"]; // people who handle money and registration

export const PERMISSIONS = {
  department: {
    read: ALL_ROLES,
    create: ["ADMIN"],
    update: ["ADMIN"],
    delete: ["ADMIN"],
  },
  doctor: {
    read: ALL_ROLES,
    create: ["ADMIN"],
    update: ["ADMIN"],
    delete: ["ADMIN"],
  },
  nurse: {
    // The full staff list is for admins. Other roles only get a name list for the forms that need one.
    read: ["ADMIN"],
    create: ["ADMIN"],
    update: ["ADMIN"],
    delete: ["ADMIN"],
  },
  room: {
    read: ALL_ROLES,
    create: ["ADMIN"],
    update: ["ADMIN", "RECEPTIONIST"],
    delete: ["ADMIN"],
  },
  patient: {
    read: ALL_ROLES,
    create: ["ADMIN", "RECEPTIONIST"],
    update: ["ADMIN", "RECEPTIONIST", "DOCTOR", "NURSE"],
    delete: ["ADMIN"],
  },
  appointment: {
    read: ALL_ROLES,
    create: ["ADMIN", "RECEPTIONIST"],
    update: ["ADMIN", "RECEPTIONIST", "DOCTOR"],
    delete: ["ADMIN", "RECEPTIONIST"],
  },
  admission: {
    read: ALL_ROLES,
    create: ["ADMIN", "RECEPTIONIST"],
    update: ["ADMIN", "RECEPTIONIST"],
    updateAdmissionStatus: ["ADMIN", "RECEPTIONIST", "NURSE"],
    delete: ["ADMIN"],
  },
  // Clinical notes and prescriptions are not for the front desk: that is the minimum-necessary rule.
  medicalRecord: {
    read: CLINICAL,
    create: ["ADMIN", "DOCTOR"],
    update: ["ADMIN", "DOCTOR"],
    updateVitals: ["ADMIN", "DOCTOR", "NURSE"],
    delete: ["ADMIN"],
  },
  prescription: {
    read: CLINICAL,
    create: ["ADMIN", "DOCTOR"],
    update: ["ADMIN", "DOCTOR"],
    delete: ["ADMIN"],
  },
  // Bills are not for doctors and nurses.
  billing: {
    read: FRONT_DESK,
    create: ["ADMIN", "RECEPTIONIST"],
    update: ["ADMIN", "RECEPTIONIST"],
    delete: ["ADMIN"],
  },
  settings: {
    read: ALL_ROLES,
    update: ["ADMIN"],
  },
  auditLog: {
    read: ["ADMIN"],
  },
  contactMessage: {
    read: FRONT_DESK,
    update: FRONT_DESK,
  },
} satisfies Record<string, Partial<Record<Action, Role[]>>>;

export type Resource = keyof typeof PERMISSIONS;

export function can(role: Role | undefined, resource: Resource, action: Action): boolean {
  if (!role) return false;
  const allowed = (PERMISSIONS[resource] as Partial<Record<Action, Role[]>>)[action];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function canRead(role: Role | undefined, resource?: Resource): boolean {
  if (!role) return false;
  if (!resource) return ALL_ROLES.includes(role);
  return can(role, resource, "read");
}

/**
 * The signed-in user as the DATABASE sees them right now. A login token stays valid for hours, so a nurse who
 * was deactivated this morning, or an admin demoted an hour ago, would otherwise keep their old access until the
 * token expired. Every server action and page re-checks the account, and the role used for permission
 * decisions comes from the database, not from the token.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UserError("Please sign in again.");
  const live = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isActive: true, role: true, name: true, mustChangePassword: true },
  });
  if (!live || !live.isActive) throw new UserError("This account is no longer active.");
  if (live.mustChangePassword) throw new UserError("Choose a new password before using the portal.");
  session.user.role = live.role;
  session.user.name = live.name;
  return session;
}

export async function requirePermission(resource: Resource, action: Action) {
  const session = await requireSession();
  if (!can(session.user.role, resource, action)) {
    throw new UserError(`Your role (${session.user.role.toLowerCase()}) is not allowed to do that.`);
  }
  return session;
}
