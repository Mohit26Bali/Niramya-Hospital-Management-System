import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { HOSPITAL_TIMEZONE } from "@/lib/time";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: HOSPITAL_TIMEZONE }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: HOSPITAL_TIMEZONE }).format(
    new Date(date)
  );
}

export function calculateAge(dob: Date | string): number {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

/** Clean professional monogram-style avatar, used for public-facing doctor photos. */
export function doctorAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f766e&textColor=ffffff`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const SEQUENCE_PREFIX_PAD: Record<string, number> = {
  PAT: 5,
  APT: 6,
  ADM: 5,
  INV: 5,
};

export function generateSequenceNumber(prefix: string, sequence: number): string {
  const pad = SEQUENCE_PREFIX_PAD[prefix] ?? 5;
  return `${prefix}-${String(sequence).padStart(pad, "0")}`;
}
