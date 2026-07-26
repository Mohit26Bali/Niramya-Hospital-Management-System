"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import {
  admissionSchema,
  admissionStatusUpdateSchema,
  dischargeAdmissionSchema,
  type AdmissionInput,
} from "@/schemas/admission.schema";
import type { AdmissionStatus } from "@prisma/client";
import * as AdmissionService from "@/server/services/admission.service";

export async function listAdmissionsAction(
  searchParams: Record<string, string | string[] | undefined>
) {
  const params = parseSearchParams(searchParams);
  return AdmissionService.listAdmissions(params);
}

export async function createAdmissionAction(input: AdmissionInput) {
  const session = await requirePermission("admission", "create");
  const data = admissionSchema.parse(input);
  await AdmissionService.createAdmission(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/admissions");
  revalidatePath("/dashboard/rooms");
}

export async function updateAdmissionAction(id: string, input: AdmissionInput) {
  const session = await requirePermission("admission", "update");
  const data = admissionSchema.parse(input);
  await AdmissionService.updateAdmission(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/admissions");
  revalidatePath("/dashboard/rooms");
}

export async function dischargeAdmissionAction(id: string, dischargeSummary?: string) {
  const session = await requirePermission("admission", "update");
  const { dischargeSummary: parsedSummary } = dischargeAdmissionSchema.parse({
    dischargeSummary,
  });
  await AdmissionService.dischargeAdmission(id, parsedSummary, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/admissions");
  revalidatePath("/dashboard/rooms");
}

export async function updateAdmissionStatusAction(id: string, status: AdmissionStatus) {
  const session = await requirePermission("admission", "updateAdmissionStatus");
  const { status: parsedStatus } = admissionStatusUpdateSchema.parse({ status });
  await AdmissionService.updateAdmissionStatus(id, parsedStatus, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/admissions");
}

export async function deleteAdmissionAction(id: string) {
  const session = await requirePermission("admission", "delete");
  await AdmissionService.deleteAdmission(id, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/admissions");
  revalidatePath("/dashboard/rooms");
}
