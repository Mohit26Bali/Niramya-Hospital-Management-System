"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { runAction } from "@/lib/action-result";
import * as ContactService from "@/server/services/contact.service";

export async function markContactMessageHandledAction(id: string) {
  return runAction(async () => {
    const session = await requirePermission("contactMessage", "update");
    await ContactService.markContactMessageHandled(id, {
      id: session.user.id,
      name: session.user.name ?? "Unknown",
      role: session.user.role,
    });
    revalidatePath("/dashboard/messages");
  });
}
