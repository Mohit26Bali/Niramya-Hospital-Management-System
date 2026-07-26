"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/permissions";

export async function getRecentNotifications() {
  await requireSession();
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    where: { action: { in: ["CREATE", "UPDATE", "DELETE"] } },
  });
  return logs;
}
