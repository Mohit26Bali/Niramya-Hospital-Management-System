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
  Mail,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/dashboard/nurses", label: "Nurses", icon: HeartPulse, roles: ["ADMIN"] },
  { href: "/dashboard/departments", label: "Departments", icon: Building },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/rooms", label: "Rooms", icon: BedDouble },
  { href: "/dashboard/admissions", label: "Admissions", icon: ClipboardList },
  { href: "/dashboard/medical-records", label: "Medical Records", icon: ClipboardList, roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { href: "/dashboard/prescriptions", label: "Prescriptions", icon: Pill, roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { href: "/dashboard/billing", label: "Billing", icon: Wallet, roles: ["ADMIN", "RECEPTIONIST"] },
  { href: "/dashboard/messages", label: "Messages", icon: Mail, roles: ["ADMIN", "RECEPTIONIST"] },
  { href: "/dashboard/activity-log", label: "Activity Log", icon: History, roles: ["ADMIN"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];

export function visibleNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
