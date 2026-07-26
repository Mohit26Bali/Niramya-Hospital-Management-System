import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate, formatDateTime, initials } from "@/lib/utils";
import type {
  getLatestAdmissions,
  getLatestInvoices,
  getRecentPatients,
  getTodaysAppointmentsList,
} from "@/server/services/dashboard.service";

export function RecentPatientsPanel({
  patients,
}: {
  patients: Awaited<ReturnType<typeof getRecentPatients>>;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Recent patients</CardTitle>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <EmptyState title="No patients yet" />
        ) : (
          <ul className="space-y-3">
            {patients.map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/patients/${p.id}`} className="flex items-center gap-3 group">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-accent text-xs text-accent-foreground">
                      {initials(`${p.firstName} ${p.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground group-hover:underline">
                      {p.firstName} {p.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(p.registeredAt)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function TodaysAppointmentsPanel({
  appointments,
}: {
  appointments: Awaited<ReturnType<typeof getTodaysAppointmentsList>>;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Today&apos;s appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <EmptyState title="No appointments today" />
        ) : (
          <ul className="space-y-3">
            {appointments.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {a.patient.firstName} {a.patient.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Dr. {a.doctor.firstName} {a.doctor.lastName} · {formatDateTime(a.scheduledAt)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function LatestAdmissionsPanel({
  admissions,
}: {
  admissions: Awaited<ReturnType<typeof getLatestAdmissions>>;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Latest admissions</CardTitle>
      </CardHeader>
      <CardContent>
        {admissions.length === 0 ? (
          <EmptyState title="No admissions yet" />
        ) : (
          <ul className="space-y-3">
            {admissions.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {a.patient.firstName} {a.patient.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Room {a.room.roomNumber} · {formatDate(a.admittedAt)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function LatestInvoicesPanel({
  invoices,
}: {
  invoices: Awaited<ReturnType<typeof getLatestInvoices>>;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base">Latest invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <EmptyState title="No invoices yet" />
        ) : (
          <ul className="space-y-3">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {inv.patient.firstName} {inv.patient.lastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{inv.invoiceNumber}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(Number(inv.totalAmount))}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
