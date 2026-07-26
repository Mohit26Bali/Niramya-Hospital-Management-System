import { auth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { listAppointmentsAction } from "@/actions/appointment.actions";
import { PageHeader } from "@/components/shared/page-header";
import { AppointmentsView } from "@/components/appointments/appointments-view";
import type { AppointmentRow } from "@/components/appointments/appointment-columns";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [session, result] = await Promise.all([auth(), listAppointmentsAction(params)]);

  return (
    <div>
      <PageHeader title="Appointments" description="Schedule and manage patient appointments" />
      <AppointmentsView
        result={{ ...result, data: result.data as AppointmentRow[] }}
        canCreate={can(session?.user.role, "appointment", "create")}
      />
    </div>
  );
}
