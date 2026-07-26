"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { listAllAppointmentsAction } from "@/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AppointmentRow } from "@/components/appointments/appointment-columns";

const STATUS_DOT: Record<string, string> = {
  SCHEDULED: "bg-blue-500",
  CONFIRMED: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-red-500",
  NO_SHOW: "bg-amber-500",
};

function AppointmentChip({
  appointment,
  onClick,
}: {
  appointment: AppointmentRow;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-1.5 truncate rounded px-1.5 py-0.5 text-left text-xs transition-colors hover:bg-muted"
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[appointment.status] ?? "bg-slate-400")} />
      <span className="truncate">
        {format(new Date(appointment.scheduledAt), "HH:mm")} {appointment.patient.firstName}{" "}
        {appointment.patient.lastName}
      </span>
    </button>
  );
}

function AppointmentDetailDialog({
  appointment,
  onOpenChange,
}: {
  appointment: AppointmentRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!appointment} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {appointment ? (
          <>
            <DialogHeader>
              <DialogTitle>{appointment.appointmentNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium text-foreground">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Doctor</span>
                <span className="font-medium text-foreground">
                  Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium text-foreground">{appointment.department.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled at</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(appointment.scheduledAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-foreground">{appointment.durationMins} mins</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={appointment.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reason</span>
                <span className="font-medium text-foreground">{appointment.reason}</span>
              </div>
              {appointment.notes ? (
                <div>
                  <span className="text-muted-foreground">Notes</span>
                  <p className="mt-1 text-foreground">{appointment.notes}</p>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DayList({
  day,
  appointments,
  onSelect,
}: {
  day: Date;
  appointments: AppointmentRow[];
  onSelect: (a: AppointmentRow) => void;
}) {
  const dayAppointments = appointments
    .filter((a) => isSameDay(new Date(a.scheduledAt), day))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  if (dayAppointments.length === 0) {
    return <p className="text-sm text-muted-foreground">No appointments scheduled for this day.</p>;
  }

  return (
    <div className="space-y-2">
      {dayAppointments.map((a) => (
        <button
          key={a.id}
          onClick={() => onSelect(a)}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
        >
          <div>
            <p className="font-medium text-foreground">
              {a.patient.firstName} {a.patient.lastName}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(a.scheduledAt), "HH:mm")} · Dr. {a.doctor.firstName} {a.doctor.lastName} ·{" "}
              {a.reason}
            </p>
          </div>
          <StatusBadge status={a.status} />
        </button>
      ))}
    </div>
  );
}

export function AppointmentCalendar() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRow | null>(null);

  useEffect(() => {
    listAllAppointmentsAction()
      .then((data) => setAppointments(data as AppointmentRow[]))
      .finally(() => setLoading(false));
  }, []);

  const monthGrid = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const weekGrid = useMemo(() => {
    const start = startOfWeek(selectedDay);
    const end = endOfWeek(selectedDay);
    return eachDayOfInterval({ start, end });
  }, [selectedDay]);

  function appointmentsForDay(day: Date) {
    return appointments.filter((a) => isSameDay(new Date(a.scheduledAt), day));
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCursor((c) => subMonths(c, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-medium text-foreground">{format(cursor, "MMMM yyyy")}</p>
            <Button variant="outline" size="sm" onClick={() => setCursor((c) => addMonths(c, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading appointments…</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-7 border-b border-border bg-muted/50 text-center text-xs font-medium text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthGrid.map((day) => {
                  const dayAppointments = appointmentsForDay(day);
                  const visible = dayAppointments.slice(0, 3);
                  const overflow = dayAppointments.length - visible.length;
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[92px] border-b border-r border-border p-1.5 last:border-r-0",
                        !isSameMonth(day, cursor) && "bg-muted/20 text-muted-foreground"
                      )}
                    >
                      <button
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          "mb-1 inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                          isToday(day) && "bg-primary text-primary-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </button>
                      <div className="space-y-0.5">
                        {visible.map((a) => (
                          <AppointmentChip key={a.id} appointment={a} onClick={() => setSelectedAppointment(a)} />
                        ))}
                        {overflow > 0 ? (
                          <button
                            onClick={() => setSelectedDay(day)}
                            className="px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            +{overflow} more
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="week" className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setSelectedDay((d) => addDays(d, -7))}>
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-medium text-foreground">
              {format(weekGrid[0], "MMM d")} – {format(weekGrid[6], "MMM d, yyyy")}
            </p>
            <Button variant="outline" size="sm" onClick={() => setSelectedDay((d) => addDays(d, 7))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
            {weekGrid.map((day) => (
              <div key={day.toISOString()} className="rounded-xl border border-border bg-card p-2">
                <p
                  className={cn(
                    "mb-2 text-xs font-medium",
                    isToday(day) ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {format(day, "EEE d")}
                </p>
                <div className="space-y-1">
                  {appointmentsForDay(day).length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">—</p>
                  ) : (
                    appointmentsForDay(day).map((a) => (
                      <AppointmentChip key={a.id} appointment={a} onClick={() => setSelectedAppointment(a)} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="day" className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setSelectedDay((d) => addDays(d, -1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <p className="text-sm font-medium text-foreground">{format(selectedDay, "EEEE, MMM d, yyyy")}</p>
            <Button variant="outline" size="sm" onClick={() => setSelectedDay((d) => addDays(d, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <DayList day={selectedDay} appointments={appointments} onSelect={setSelectedAppointment} />
        </TabsContent>
      </Tabs>

      <AppointmentDetailDialog appointment={selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)} />
    </div>
  );
}
