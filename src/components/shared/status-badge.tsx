import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "warning" | "critical" | "info" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  warning:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  critical:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  neutral:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
};

const STATUS_TONE_MAP: Record<string, BadgeTone> = {
  // Appointment
  SCHEDULED: "info",
  CONFIRMED: "info",
  COMPLETED: "success",
  CANCELLED: "critical",
  NO_SHOW: "warning",
  // Admission
  ADMITTED: "warning",
  DISCHARGED: "success",
  TRANSFERRED: "info",
  // Room
  AVAILABLE: "success",
  OCCUPIED: "critical",
  CLEANING: "neutral",
  // Invoice
  PENDING: "warning",
  PAID: "success",
  PARTIALLY_PAID: "warning",
  // generic
  ACTIVE: "success",
  INACTIVE: "neutral",
  // Audit actions
  CREATE: "success",
  UPDATE: "info",
  DELETE: "critical",
  LOGIN: "neutral",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = STATUS_TONE_MAP[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className
      )}
    >
      {status
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")}
    </span>
  );
}
