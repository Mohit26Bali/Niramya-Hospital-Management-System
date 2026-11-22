import "server-only";
import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/server/services/audit.service";
import type { ContactInput } from "@/schemas/contact.schema";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

/** Stores a message from the public Contact page so staff can read and answer it. */
export async function createContactMessage(input: ContactInput) {
  return prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      subject: input.subject,
      message: input.message,
    },
  });
}

export async function listContactMessages(limit = 100) {
  return prisma.contactMessage.findMany({ orderBy: [{ handledAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }], take: limit });
}

export async function countOpenContactMessages() {
  return prisma.contactMessage.count({ where: { handledAt: null } });
}

export async function markContactMessageHandled(id: string, actor: Actor) {
  const message = await prisma.contactMessage.update({
    where: { id },
    data: { handledAt: new Date(), handledBy: actor.name },
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "ContactMessage",
    entityId: message.id,
    details: { handled: true },
  });
  return message;
}
