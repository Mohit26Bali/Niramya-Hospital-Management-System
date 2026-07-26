import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { globalSearch } from "@/server/services/search.service";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ results: [] }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const results = await globalSearch(q);
  return NextResponse.json({ results });
}
