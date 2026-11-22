/**
 * The hospital works in ONE time zone. Servers (Vercel, Docker) usually run in UTC, so "today" and every
 * displayed time must be computed for the hospital's zone explicitly, never from the server's own clock
 * settings: an 11:30 pm appointment in Kolkata is already "tomorrow" in UTC, and a 9:00 am one would be
 * shown as 3:30 am.
 */
export const HOSPITAL_TIMEZONE = process.env.NEXT_PUBLIC_HOSPITAL_TIMEZONE || "Asia/Kolkata";

type Parts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

export function zonedParts(date: Date, timeZone = HOSPITAL_TIMEZONE): Parts {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const get: Record<string, number> = {};
  for (const p of f.formatToParts(date)) if (p.type !== "literal") get[p.type] = Number(p.value);
  return { year: get.year, month: get.month, day: get.day, hour: get.hour, minute: get.minute, second: get.second };
}

/** Milliseconds the zone is ahead of UTC at that instant (e.g. +19,800,000 for India). */
export function zoneOffsetMs(date: Date, timeZone = HOSPITAL_TIMEZONE): number {
  const p = zonedParts(date, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant a local calendar day starts in the hospital's zone. */
export function startOfZonedDay(date: Date = new Date(), timeZone = HOSPITAL_TIMEZONE): Date {
  const p = zonedParts(date, timeZone);
  const guess = new Date(Date.UTC(p.year, p.month - 1, p.day));
  return new Date(guess.getTime() - zoneOffsetMs(guess, timeZone));
}

/** The last millisecond of that local day. */
export function endOfZonedDay(date: Date = new Date(), timeZone = HOSPITAL_TIMEZONE): Date {
  const next = new Date(startOfZonedDay(date, timeZone).getTime() + 36 * 3600 * 1000);
  return new Date(startOfZonedDay(next, timeZone).getTime() - 1);
}

/** Hour of day (0-23) in the hospital's zone. */
export function zonedHour(date: Date, timeZone = HOSPITAL_TIMEZONE): number {
  return zonedParts(date, timeZone).hour;
}

/** Start of the local calendar month containing the date. */
export function startOfZonedMonth(date: Date = new Date(), timeZone = HOSPITAL_TIMEZONE): Date {
  const p = zonedParts(date, timeZone);
  const guess = new Date(Date.UTC(p.year, p.month - 1, 1));
  return new Date(guess.getTime() - zoneOffsetMs(guess, timeZone));
}

/** "12 Aug 2026, 10:30 am" in the hospital's zone. */
export function formatZonedDateTime(date: Date, timeZone = HOSPITAL_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone }).format(date);
}
