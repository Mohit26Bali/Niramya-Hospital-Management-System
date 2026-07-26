import { z } from "zod";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(DEFAULT_PAGE_SIZE),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export function toSkipTake(params: Pick<PaginationParams, "page" | "pageSize">) {
  return {
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
  };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  params: Pick<PaginationParams, "page" | "pageSize">
): PaginatedResult<T> {
  return {
    data,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}

export function parseSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): PaginationParams {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return paginationSchema.parse(flat);
}
