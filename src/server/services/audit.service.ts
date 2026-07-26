import "server-only";
import type { AuditAction, Role, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function recordAudit(params: {
  userId: string;
  userName: string;
  userRole: Role;
  action: AuditAction;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      userName: params.userName,
      userRole: params.userRole,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details as Prisma.InputJsonValue | undefined,
    },
  });
}
