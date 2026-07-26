import { Calendar, ClipboardList, Pill, Wallet, BedDouble } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type {
  Admission,
  Appointment,
  Department,
  Doctor,
  Invoice,
  InvoiceItem,
  MedicalRecord,
  Prescription,
  PrescriptionItem,
  Room,
} from "@prisma/client";

type TimelineEvent = {
  id: string;
  date: Date;
  icon: LucideIcon;
  title: string;
  description: string;
};

export function PatientTimeline({
  appointments,
  medicalRecords,
  prescriptions,
  admissions,
  invoices,
}: {
  appointments: (Appointment & { doctor: Doctor; department: Department })[];
  medicalRecords: (MedicalRecord & { doctor: Doctor })[];
  prescriptions: (Prescription & { doctor: Doctor; items: PrescriptionItem[] })[];
  admissions: (Admission & { doctor: Doctor; room: Room })[];
  invoices: (Invoice & { items: InvoiceItem[] })[];
}) {
  const events: TimelineEvent[] = [
    ...appointments.map((a) => ({
      id: `apt-${a.id}`,
      date: a.scheduledAt,
      icon: Calendar,
      title: `Appointment with Dr. ${a.doctor.firstName} ${a.doctor.lastName}`,
      description: `${a.department.name} · ${a.status.replace("_", " ")} · ${a.reason}`,
    })),
    ...medicalRecords.map((m) => ({
      id: `mr-${m.id}`,
      date: m.visitDate,
      icon: ClipboardList,
      title: `Visit diagnosed: ${m.diagnosis}`,
      description: `Dr. ${m.doctor.firstName} ${m.doctor.lastName} · ${m.chiefComplaint}`,
    })),
    ...prescriptions.map((p) => ({
      id: `rx-${p.id}`,
      date: p.issuedAt,
      icon: Pill,
      title: `Prescription issued`,
      description: `Dr. ${p.doctor.firstName} ${p.doctor.lastName} · ${p.items
        .map((i) => i.medicineName)
        .join(", ")}`,
    })),
    ...admissions.map((ad) => ({
      id: `adm-${ad.id}`,
      date: ad.admittedAt,
      icon: BedDouble,
      title: `Admitted — Room ${ad.room.roomNumber}`,
      description: `Dr. ${ad.doctor.firstName} ${ad.doctor.lastName} · ${ad.status.replace("_", " ")} · ${ad.reason}`,
    })),
    ...invoices.map((inv) => ({
      id: `inv-${inv.id}`,
      date: inv.issuedAt,
      icon: Wallet,
      title: `Invoice ${inv.invoiceNumber} — ${formatCurrency(Number(inv.totalAmount))}`,
      description: `${inv.status.replace("_", " ")}`,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (events.length === 0) {
    return (
      <EmptyState
        title="No history yet"
        description="Appointments, visits, prescriptions, admissions and invoices will appear here chronologically."
      />
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-border pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-[31px] flex size-6 items-center justify-center rounded-full border border-border bg-card">
            <event.icon className="size-3 text-primary" />
          </span>
          <p className="text-sm font-medium text-foreground">{event.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(event.date)}</p>
        </li>
      ))}
    </ol>
  );
}
