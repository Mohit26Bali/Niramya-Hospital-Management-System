"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function DataTableColumnHeader({
  title,
  sortKey,
  className,
}: {
  title: string;
  sortKey?: string;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!sortKey) return <span className={className}>{title}</span>;

  const currentSortBy = searchParams.get("sortBy");
  const currentSortDir = searchParams.get("sortDir") ?? "desc";
  const isActive = currentSortBy === sortKey;

  const handleSort = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", sortKey);
    params.set("sortDir", isActive && currentSortDir === "asc" ? "desc" : "asc");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <button
      onClick={handleSort}
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground",
        className
      )}
    >
      {title}
      {isActive ? (
        currentSortDir === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ChevronsUpDown className="size-3.5 opacity-50" />
      )}
    </button>
  );
}
