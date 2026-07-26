import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  HeartPulse,
  Building,
  Calendar,
  BedDouble,
  ClipboardList,
  Pill,
  Wallet,
  Settings,
  History,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patients", label: "Patients", icon: Users },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/nurses", label: "Nurses", icon: HeartPulse, roles: ["ADMIN"] },
  { href: "/departments", label: "Departments", icon: Building },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/rooms", label: "Rooms", icon: BedDouble },
  { href: "/admissions", label: "Admissions", icon: ClipboardList },
  { href: "/medical-records", label: "Medical Records", icon: ClipboardList },
  { href: "/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/billing", label: "Billing", icon: Wallet, roles: ["ADMIN", "RECEPTIONIST"] },
  { href: "/activity-log", label: "Activity Log", icon: History, roles: ["ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];

export function visibleNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
