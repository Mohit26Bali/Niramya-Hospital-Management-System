import { z } from "zod";

export const roomTypeValues = ["GENERAL", "PRIVATE", "ICU", "EMERGENCY"] as const;
export const roomStatusValues = ["AVAILABLE", "OCCUPIED", "CLEANING"] as const;

export const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  type: z.enum(roomTypeValues, { message: "Select a room type" }),
  floor: z.coerce.number().int().min(0, "Floor must be 0 or higher"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").default(1),
  ratePerDay: z.coerce.number().min(0, "Rate must be 0 or higher"),
  status: z.enum(roomStatusValues).default("AVAILABLE"),
});

export type RoomInput = z.infer<typeof roomSchema>;
export type RoomFormValues = z.input<typeof roomSchema>;

export const roomStatusSchema = z.object({
  status: z.enum(roomStatusValues),
});

export type RoomStatusInput = z.infer<typeof roomStatusSchema>;
