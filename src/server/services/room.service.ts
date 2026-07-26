import "server-only";
import { prisma } from "@/lib/prisma";
import { buildPaginatedResult, toSkipTake, type PaginationParams } from "@/lib/pagination";
import type { RoomInput } from "@/schemas/room.schema";
import { recordAudit } from "@/server/services/audit.service";
import type { Role, RoomStatus } from "@prisma/client";

type Actor = { id: string; name: string; role: Role };

export async function listRooms(params: PaginationParams) {
  const where = {
    isActive: true,
    ...(params.search
      ? { roomNumber: { contains: params.search, mode: "insensitive" as const } }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.room.findMany({
      where,
      ...toSkipTake(params),
      orderBy: params.sortBy ? { [params.sortBy]: params.sortDir } : { roomNumber: "asc" },
    }),
    prisma.room.count({ where }),
  ]);

  return buildPaginatedResult(data, total, params);
}

export async function listAllActiveRooms() {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { roomNumber: "asc" },
  });
  return rooms.map((r) => ({ ...r, ratePerDay: Number(r.ratePerDay) }));
}

export async function createRoom(input: RoomInput, actor: Actor) {
  const room = await prisma.room.create({ data: input });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "CREATE",
    entity: "Room",
    entityId: room.id,
    details: { roomNumber: room.roomNumber },
  });
  return room;
}

export async function updateRoom(id: string, input: RoomInput, actor: Actor) {
  const room = await prisma.room.update({ where: { id }, data: input });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Room",
    entityId: room.id,
    details: { roomNumber: room.roomNumber },
  });
  return room;
}

export async function softDeleteRoom(id: string, actor: Actor) {
  const room = await prisma.room.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "DELETE",
    entity: "Room",
    entityId: room.id,
    details: { roomNumber: room.roomNumber },
  });
  return room;
}

export async function updateRoomStatus(id: string, status: RoomStatus, actor: Actor) {
  const room = await prisma.room.update({ where: { id }, data: { status } });
  await recordAudit({
    userId: actor.id,
    userName: actor.name,
    userRole: actor.role,
    action: "UPDATE",
    entity: "Room",
    entityId: room.id,
    details: { roomNumber: room.roomNumber, status: room.status },
  });
  return room;
}
