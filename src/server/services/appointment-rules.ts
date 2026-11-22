import "server-only";
import type { AppointmentStatus, Prisma } from "@prisma/client";
import { UserError } from "@/lib/action-result";
import { formatZonedDateTime } from "@/lib/time";

// How long a booking may sit in the past: a walk-in is registered a few minutes after they arrive.
export const PAST_TOLERANCE_MS = 15 * 60 * 1000;
export const MAX_DURATION_MINS = 240;

// The states in which an appointment still occupies the doctor's time.
export const ACTIVE_STATUSES: AppointmentStatus[] = ["SCHEDULED", "CONFIRMED"];

/** Which status may follow which. Finished appointments (completed, cancelled, no-show) are never reopened. */
export const STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  SCHEDULED: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const label = (status: AppointmentStatus) => status.toLowerCase().replace("_", "-");

type Tx = Prisma.TransactionClient;
type Booking = {
  patientId: string;
  doctorId: string;
  departmentId: string;
  scheduledAt: Date;
  durationMins: number;
};

export function assertNotInPast(when: Date) {
  if (when.getTime() < Date.now() - PAST_TOLERANCE_MS) {
    throw new UserError("That time has already passed. Choose a time from now on.");
  }
}

export function assertTransitionAllowed(from: AppointmentStatus, to: AppointmentStatus, scheduledAt: Date) {
  if (from === to) return;
  if (!STATUS_TRANSITIONS[from].includes(to)) {
    throw new UserError(`A ${label(from)} appointment cannot be changed to ${label(to)}.`);
  }
  if (to === "NO_SHOW" && scheduledAt.getTime() > Date.now()) {
    throw new UserError("An appointment cannot be marked no-show before its time.");
  }
}

/**
 * The checks every booking must pass. Call it inside a transaction: it takes a lock on the doctor, so two
 * clerks (or a clerk and the public website) cannot both take the same slot.
 */
export async function assertBookable(tx: Tx, input: Booking, ignoreId?: string) {
  const start = input.scheduledAt;
  const duration = input.durationMins;
  if (!Number.isFinite(start.getTime())) throw new UserError("Choose a valid date and time.");
  if (!Number.isInteger(duration) || duration < 5 || duration > MAX_DURATION_MINS) {
    throw new UserError(`The visit length must be between 5 and ${MAX_DURATION_MINS} minutes.`);
  }
  const end = new Date(start.getTime() + duration * 60_000);

  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"appointments:" + input.doctorId}))`;

  const [doctor, patient] = await Promise.all([
    tx.doctor.findUnique({ where: { id: input.doctorId } }),
    tx.patient.findUnique({ where: { id: input.patientId } }),
  ]);
  if (!doctor || !doctor.isActive) throw new UserError("That doctor is no longer available.");
  if (!doctor.isAvailable) throw new UserError(`Dr. ${doctor.lastName} is not taking appointments right now.`);
  if (!patient || !patient.isActive) throw new UserError("That patient could not be found.");
  if (doctor.departmentId !== input.departmentId) {
    throw new UserError("That doctor does not work in the selected department.");
  }

  const nearby = (extra: Prisma.AppointmentWhereInput) =>
    tx.appointment.findMany({
      where: {
        status: { in: ACTIVE_STATUSES },
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
        // Anything that starts before this one ends, and could still be running when it starts.
        scheduledAt: { lt: end, gte: new Date(start.getTime() - MAX_DURATION_MINS * 60_000) },
        ...extra,
      },
      select: { scheduledAt: true, durationMins: true },
    });
  const overlaps = (list: { scheduledAt: Date; durationMins: number }[]) =>
    list.some((a) => a.scheduledAt.getTime() + a.durationMins * 60_000 > start.getTime());

  if (overlaps(await nearby({ doctorId: input.doctorId }))) {
    throw new UserError(
      `Dr. ${doctor.lastName} already has an appointment at that time (${formatZonedDateTime(start)}). Choose another slot.`
    );
  }
  if (overlaps(await nearby({ patientId: input.patientId }))) {
    throw new UserError("This patient already has another appointment at that time.");
  }
}
