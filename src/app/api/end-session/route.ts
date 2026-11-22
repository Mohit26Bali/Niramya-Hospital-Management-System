import { signOut } from "@/lib/auth";

/**
 * Ends the browser session. The dashboard sends people here when their account was deactivated or removed
 * while they were signed in: a page render cannot clear cookies, a route handler can.
 */
export async function GET() {
  await signOut({ redirectTo: "/login?reason=ended" });
}
