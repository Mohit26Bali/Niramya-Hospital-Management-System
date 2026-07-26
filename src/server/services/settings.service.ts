import "server-only";
import { prisma } from "@/lib/prisma";
import type { HospitalProfileInput } from "@/schemas/settings.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

export async function getHospitalProfile() {
  const existing = await prisma.hospitalProfile.findFirst();
  if (existing) return existing;
  return prisma.hospitalProfile.create({ data: {} });
}

export async function updateHospitalProfile(input: HospitalProfileInput, actor: Actor) {
  const existing = await getHospitalProfile();
  const updated = await prisma.hospitalProfile.update({
    where: { id: existing.id },
    data: {
      name: input.name,
      tagline: input.tagline || "",
      address: input.address || "",
      phone: input.phone || "",
      email: input.email || "",
    },
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "HospitalProfile",
    entityId: updated.id,
  });
  return updated;
}
