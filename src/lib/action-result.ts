/**
 * Messages written for the person using the app (not bugs): "that doctor is already booked at 10:00".
 *
 * Next.js hides the message of any error thrown from a Server Action in production builds (it shows a generic
 * "an error occurred"), so a thrown Error can never tell a receptionist WHY their booking was refused. A
 * UserError is turned into a returned value instead, and the browser re-raises it as a normal message.
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserError";
  }
}

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/** Runs an action body: UserError becomes { ok: false }, anything else is a real failure and still throws. */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    if (error instanceof UserError) return { ok: false, error: error.message };
    throw error;
  }
}

/** Browser side: unwrap a result, raising its message as an Error so the existing toast code shows it. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error);
  return result.data;
}
