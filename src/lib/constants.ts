import type {
  AdmissionStatus,
  AppointmentStatus,
  InvoiceStatus,
  Role,
  RoomStatus,
} from "@prisma/client";

export const ROLES: Role[] = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export const ADMISSION_STATUS_LABELS: Record<AdmissionStatus, string> = {
  ADMITTED: "Admitted",
  DISCHARGED: "Discharged",
  TRANSFERRED: "Transferred",
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  AVAILABLE: "Available",
  OCCUPIED: "Occupied",
  CLEANING: "Cleaning",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PARTIALLY_PAID: "Partially Paid",
  CANCELLED: "Cancelled",
};

export const DEFAULT_PAGE_SIZE = 10;
