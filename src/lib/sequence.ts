import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Db = Prisma.TransactionClient | typeof prisma;

const PAD: Record<string, number> = { PAT: 5, APT: 6, ADM: 5, INV: 5, DOC: 5, NUR: 5 };

/**
 * Next number for a prefix (PAT-00042, APT-000317 ...), taken from a counter row with ONE atomic
 * statement. The earlier approach (count the rows, add one) handed the same number to two requests that
 * arrived together, and re-used an old number after any row was deleted; both end in a unique-key error.
 */
export async function nextNumber(prefix: keyof typeof PAD, db: Db = prisma): Promise<string> {
  const rows = await db.$queryRaw<{ value: number }[]>`
    INSERT INTO "Counter" ("name", "value") VALUES (${prefix}, 1)
    ON CONFLICT ("name") DO UPDATE SET "value" = "Counter"."value" + 1
    RETURNING "value"`;
  return `${prefix}-${String(rows[0].value).padStart(PAD[prefix] ?? 5, "0")}`;
}
