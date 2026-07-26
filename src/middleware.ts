import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

const ROUTE_ROLE_MAP: { prefix: string; roles: Role[] }[] = [
  { prefix: "/billing", roles: ["ADMIN", "RECEPTIONIST"] },
  { prefix: "/settings", roles: ["ADMIN"] },
  { prefix: "/activity-log", roles: ["ADMIN"] },
  { prefix: "/nurses", roles: ["ADMIN"] },
];

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login")) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", req.nextUrl));
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = req.auth!.user.role;
  const rule = ROUTE_ROLE_MAP.find((r) => pathname.startsWith(r.prefix));
  if (rule && !rule.roles.includes(role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|logo.png|illustrations).*)"],
};
