import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";

const ROUTE_ROLE_MAP: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard/billing", roles: ["ADMIN", "RECEPTIONIST"] },
  { prefix: "/dashboard/messages", roles: ["ADMIN", "RECEPTIONIST"] },
  // Clinical notes and prescriptions are not for the front desk.
  { prefix: "/dashboard/medical-records", roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { prefix: "/dashboard/prescriptions", roles: ["ADMIN", "DOCTOR", "NURSE"] },
  { prefix: "/dashboard/settings", roles: ["ADMIN"] },
  { prefix: "/dashboard/activity-log", roles: ["ADMIN"] },
  { prefix: "/dashboard/nurses", roles: ["ADMIN"] },
];

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login")) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    return NextResponse.next();
  }

  // Everything outside /dashboard is the public site — no session required.
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // An account created with a temporary password can do nothing until its owner has chosen their own.
  if (req.auth!.user.mustChangePassword && !pathname.startsWith("/dashboard/change-password")) {
    return NextResponse.redirect(new URL("/dashboard/change-password", req.nextUrl));
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
