import "server-only";
import { prisma } from "@/lib/prisma";
import type { PublicBookingInput } from "@/schemas/public-booking.schema";
import { APPOINTMENT_TYPE_LABELS } from "@/schemas/public-booking.schema";
import * as PatientService from "@/server/services/patient.service";
import * as AppointmentService from "@/server/services/appointment.service";
import { UserError } from "@/lib/action-result";
import { zonedHour, zonedParts } from "@/lib/time";
import type { Role } from "@prisma/client";

const SYSTEM_ACTOR_EMAIL = "website@niramaya.internal";

// Outpatient desk hours (hospital time) and how far ahead the website takes bookings.
export const BOOKING_OPEN_HOUR = Number(process.env.BOOKING_OPEN_HOUR ?? 8);
export const BOOKING_CLOSE_HOUR = Number(process.env.BOOKING_CLOSE_HOUR ?? 20);
export const BOOKING_MAX_DAYS_AHEAD = 90;
const SLOT_UNAVAILABLE = "That time is not available. Please choose another time or doctor.";

/**
 * Looks up the seeded system User used to attribute audit-log entries for bookings submitted through the public
 * website. This user is isActive:false so it can never log in; its id/name/role are only an audit actor.
 */
async function getSystemWebsiteActor(): Promise<{ id: string; name: string; role: Role }> {
  const user = await prisma.user.findUnique({ where: { email: SYSTEM_ACTOR_EMAIL } });
  if (!user) {
    throw new Error("System website actor is not seeded. Run `pnpm db:bootstrap` (or the seed on a demo database).");
  }
  return { id: user.id, name: user.name, role: user.role };
}

/** Only the digits, so "+91 98765-43210" and "9876543210" are recognised as the same number. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function assertWithinBookingWindow(when: Date, durationMins: number, now = new Date()) {
  if (when.getTime() < now.getTime() + 30 * 60_000) {
    throw new UserError("Please choose a time at least 30 minutes from now.");
  }
  if (when.getTime() > now.getTime() + BOOKING_MAX_DAYS_AHEAD * 86_400_000) {
    throw new UserError(`Appointments can be requested up to ${BOOKING_MAX_DAYS_AHEAD} days ahead.`);
  }
  const start = zonedHour(when);
  const startMinutes = start * 60 + zonedParts(when).minute;
  const endMinutes = startMinutes + durationMins;
  if (startMinutes < BOOKING_OPEN_HOUR * 60 || endMinutes > BOOKING_CLOSE_HOUR * 60) {
    throw new UserError(
      `The outpatient desk takes appointments between ${BOOKING_OPEN_HOUR}:00 and ${BOOKING_CLOSE_HOUR}:00. For an emergency call our emergency number.`
    );
  }
}

export async function createPublicBooking(input: PublicBookingInput) {
  const actor = await getSystemWebsiteActor();
  const durationMins = 30;
  assertWithinBookingWindow(input.preferredDateTime, durationMins);

  const doctor = await prisma.doctor.findUnique({
    where: { id: input.doctorId },
    select: { departmentId: true, isActive: true, isAvailable: true },
  });
  if (!doctor || !doctor.isActive || !doctor.isAvailable) throw new UserError(SLOT_UNAVAILABLE);

  // Reuse an existing patient only when phone, date of birth AND last name all match. A phone number alone
  // is shared by families (and typed wrongly by strangers): attaching a stranger's booking to someone's file
  // would put it in the wrong medical chart. When unsure, a new record is created and reception merges later.
  const phoneKey = normalizePhone(input.phone);
  const candidates = await prisma.patient.findMany({
    where: { isActive: true, phone: { contains: phoneKey }, lastName: { equals: input.lastName, mode: "insensitive" } },
  });
  const sameDay = (a: Date, b: Date) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
  const existing = candidates.find((p) => normalizePhone(p.phone) === phoneKey && sameDay(p.dob, input.dob));

  let patientId: string;
  if (existing) {
    patientId = existing.id;
  } else {
    const fullName = `${input.firstName} ${input.lastName}`;
    const created = await PatientService.createPatient(
      {
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        dob: input.dob,
        phone: input.phone,
        email: input.email || "",
        // The public form only collects what is needed to reach the patient. These fields are required by the
        // patient schema but unknown here; reception corrects them when the patient arrives.
        address: "To be confirmed at reception",
        city: "Not provided",
        state: "Not provided",
        pincode: "000000",
        emergencyContactName: fullName,
        emergencyContactPhone: input.phone,
      },
      actor
    );
    patientId = created.id;
  }

  const typeLabel = APPOINTMENT_TYPE_LABELS[input.appointmentType];

  try {
    const appointment = await AppointmentService.createAppointment(
      {
        patientId,
        doctorId: input.doctorId,
        // The doctor's real department wins over whatever the form sent.
        departmentId: doctor.departmentId,
        scheduledAt: input.preferredDateTime,
        durationMins,
        reason: `${typeLabel}: ${input.reason}`,
        notes: "Requested through the website. Please confirm with the patient by phone.",
      },
      actor
    );
    // Deliberately only the appointment number: an anonymous visitor must not learn whether (or under which
    // patient number) a given phone number is already registered.
    return { appointmentNumber: appointment.appointmentNumber };
  } catch (error) {
    // Anything the calendar refuses (slot taken, patient double-booked) is shown as one neutral message, so the
    // form cannot be used to probe other people's appointments.
    if (error instanceof UserError) throw new UserError(SLOT_UNAVAILABLE);
    throw error;
  }
}
