import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";

export async function listAuditLogs(params: PaginationParams) {
  const where = params.search
    ? {
        OR: [
          { userName: { contains: params.search, mode: "insensitive" as const } },
          { entity: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      ...toSkipTake(params),
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}
