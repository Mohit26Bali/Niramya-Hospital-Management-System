"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect } from "react";

export function DataTableToolbar<T extends Record<string, unknown>>({
  searchPlaceholder = "Search…",
  filters,
  exportData,
  exportFilename = "export.csv",
}: {
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  exportData?: T[];
  exportFilename?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const debounced = useDebounce(value, 350);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debounced) params.set("search", debounced);
    else params.delete("search");
    params.set("page", "1");
    startTransition(() => router.push(`?${params.toString()}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  function handleExport() {
    if (!exportData || exportData.length === 0) return;
    const headers = Object.keys(exportData[0]);
    const rows = exportData.map((row) =>
      headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportFilename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-8"
          />
        </div>
        {filters}
      </div>
      {exportData ? (
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-1.5">
          <Download className="size-3.5" /> Export CSV
        </Button>
      ) : null}
    </div>
  );
}
