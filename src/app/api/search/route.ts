import { NextResponse, type NextRequest } from "next/server";
import { can, requirePermission } from "@/lib/permissions";
import { RateLimiter } from "@/lib/rate-limit";
import { globalSearch } from "@/server/services/search.service";

// A person typing in the search box makes a request every few keystrokes; this only stops scripted scraping.
const limiter = new RateLimiter(120, 60_000);

export async function GET(req: NextRequest) {
  let session;
  try {
    session = await requirePermission("patient", "read");
  } catch {
    return NextResponse.json({ results: [] }, { status: 401 });
  }
  if (!limiter.allow(session.user.id)) {
    return NextResponse.json({ results: [] }, { status: 429, headers: { "Retry-After": "30" } });
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await globalSearch(q, { billing: can(session.user.role, "billing", "read") });
  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
