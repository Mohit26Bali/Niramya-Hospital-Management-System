"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { parseSearchParams } from "@/lib/pagination";
import { roomSchema, roomStatusSchema, type RoomInput } from "@/schemas/room.schema";
import type { RoomStatus } from "@prisma/client";
import * as RoomService from "@/server/services/room.service";

export async function listRoomsAction(searchParams: Record<string, string | string[] | undefined>) {
  const params = parseSearchParams(searchParams);
  return RoomService.listRooms(params);
}

export async function listAllActiveRoomsAction() {
  return RoomService.listAllActiveRooms();
}

export async function createRoomAction(input: RoomInput) {
  const session = await requirePermission("room", "create");
  const data = roomSchema.parse(input);
  await RoomService.createRoom(data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/rooms");
}

export async function updateRoomAction(id: string, input: RoomInput) {
  const session = await requirePermission("room", "update");
  const data = roomSchema.parse(input);
  await RoomService.updateRoom(id, data, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/rooms");
}

export async function deleteRoomAction(id: string) {
  const session = await requirePermission("room", "delete");
  await RoomService.softDeleteRoom(id, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/rooms");
}

export async function updateRoomStatusAction(id: string, status: RoomStatus) {
  const session = await requirePermission("room", "update");
  const { status: parsedStatus } = roomStatusSchema.parse({ status });
  await RoomService.updateRoomStatus(id, parsedStatus, {
    id: session.user.id,
    name: session.user.name ?? "Unknown",
    role: session.user.role,
  });
  revalidatePath("/dashboard/rooms");
}
