"use server";

import { runAction } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import {
  appointmentSchema,
  appointmentStatusUpdateSchema,
  type AppointmentInput,
} from "@/schemas/appointment.schema";
import type { AppointmentStatus } from "@prisma/client";
import * as AppointmentService from "@/server/services/appointment.service";

export async function listAppointmentsAction(
  searchParams: Record<string, string | string[] | undefined>
) {
  await requirePermission("appointment", "read");
  const params = parseSearchParams(searchParams);
  return AppointmentService.listAppointments(params);
}

export async function listAllAppointmentsAction() {
  await requirePermission("appointment", "read");
  return AppointmentService.listAllAppointments();
}

export async function listTodaysAppointmentsAction() {
  await requirePermission("appointment", "read");
  return AppointmentService.listTodaysAppointments();
}

export async function createAppointmentAction(input: AppointmentInput) {
  return runAction(async () => {
    const session = await requirePermission("appointment", "create");
    const data = appointmentSchema.parse(input);
    await AppointmentService.createAppointment(data, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/appointments");
  });
}

export async function updateAppointmentAction(id: string, input: AppointmentInput) {
  return runAction(async () => {
    const session = await requirePermission("appointment", "update");
    const data = appointmentSchema.parse(input);
    await AppointmentService.updateAppointment(id, data, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/appointments");
  });
}

export async function cancelAppointmentAction(id: string) {
  return runAction(async () => {
    const session = await requirePermission("appointment", "delete");
    await AppointmentService.cancelAppointment(id, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/appointments");
  });
}

export async function updateAppointmentStatusAction(id: string, status: AppointmentStatus) {
  return runAction(async () => {
    const session = await requirePermission("appointment", "update");
    const { status: parsedStatus } = appointmentStatusUpdateSchema.parse({ status });
    await AppointmentService.updateAppointmentStatus(id, parsedStatus, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/appointments");
  });
}
