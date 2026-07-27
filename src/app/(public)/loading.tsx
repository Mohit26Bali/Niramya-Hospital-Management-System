import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <Skeleton className="mx-auto h-4 w-32" />
      <Skeleton className="mx-auto mt-4 h-9 w-72 max-w-full" />
      <Skeleton className="mx-auto mt-3 h-4 w-96 max-w-full" />

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-6">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="mt-4 h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-1 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
