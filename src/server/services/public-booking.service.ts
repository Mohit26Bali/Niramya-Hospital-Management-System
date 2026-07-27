import "server-only";
import { prisma } from "@/lib/prisma";
import type { PublicBookingInput } from "@/schemas/public-booking.schema";
import { APPOINTMENT_TYPE_LABELS } from "@/schemas/public-booking.schema";
import * as PatientService from "@/server/services/patient.service";
import * as AppointmentService from "@/server/services/appointment.service";
import type { Role } from "@prisma/client";

const SYSTEM_ACTOR_EMAIL = "website@niramaya.internal";

/**
 * Looks up the seeded system User used to attribute audit-log entries for
 * bookings submitted through the public website. This user is isActive:false
 * so it can never log in — its id/name/role are only ever used as an audit actor.
 */
async function getSystemWebsiteActor(): Promise<{ id: string; name: string; role: Role }> {
  const user = await prisma.user.findUnique({ where: { email: SYSTEM_ACTOR_EMAIL } });
  if (!user) {
    throw new Error(
      "System website actor is not seeded. Expected a User with email website@niramaya.internal."
    );
  }
  return { id: user.id, name: user.name, role: user.role };
}

export async function createPublicBooking(input: PublicBookingInput) {
  const actor = await getSystemWebsiteActor();

  // Reuse an existing active patient record by phone if one already exists,
  // otherwise register a new patient using the exact same PatientService
  // logic (and appointmentNumber/patientNumber conventions) the internal
  // receptionist-facing forms use — createPatient itself is not
  // permission-gated (the gate lives in the patient.actions.ts server
  // action layer), so it's safe to call directly here.
  let patientId: string;
  let patientNumber: string;

  const existingPatient = await prisma.patient.findFirst({
    where: { phone: input.phone, isActive: true },
  });

  if (existingPatient) {
    patientId = existingPatient.id;
    patientNumber = existingPatient.patientNumber;
  } else {
    const fullName = `${input.firstName} ${input.lastName}`;
    const newPatient = await PatientService.createPatient(
      {
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        dob: input.dob,
        phone: input.phone,
        email: input.email || "",
        // The public booking form only collects the essentials needed to
        // reach the patient and identify them at reception. These fields
        // are required by the schema but not yet known — reception is
        // expected to correct them via the internal Patient edit form once
        // the patient arrives / is contacted for confirmation.
        address: "To be confirmed at reception",
        city: "Not provided",
        state: "Not provided",
        pincode: "000000",
        emergencyContactName: fullName,
        emergencyContactPhone: input.phone,
      },
      actor
    );
    patientId = newPatient.id;
    patientNumber = newPatient.patientNumber;
  }

  // Always trust the selected doctor's actual department over whatever the
  // form sent, so the Appointment's department is guaranteed to match the
  // doctor's real department.
  const doctor = await prisma.doctor.findUnique({
    where: { id: input.doctorId },
    select: { departmentId: true },
  });
  if (!doctor) {
    throw new Error("Selected doctor could not be found. Please choose a doctor again.");
  }

  const typeLabel = APPOINTMENT_TYPE_LABELS[input.appointmentType];

  const appointment = await AppointmentService.createAppointment(
    {
      patientId,
      doctorId: input.doctorId,
      departmentId: doctor.departmentId,
      scheduledAt: input.preferredDateTime,
      durationMins: 30,
      reason: `${typeLabel}: ${input.reason}`,
      notes: undefined,
    },
    actor
  );

  return {
    appointmentNumber: appointment.appointmentNumber,
    patientNumber,
  };
}
