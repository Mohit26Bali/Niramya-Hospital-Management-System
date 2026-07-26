import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  comparisonLabel = "vs last month",
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: number;
  comparisonLabel?: string;
}) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <Card className="border-border shadow-none transition-shadow duration-150 hover:shadow-sm">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          {typeof trend === "number" ? (
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span
                className={cn(
                  "flex items-center gap-0.5 font-medium",
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="text-muted-foreground">{comparisonLabel}</span>
            </div>
          ) : null}
        </div>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
          <Icon className="size-4.5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
