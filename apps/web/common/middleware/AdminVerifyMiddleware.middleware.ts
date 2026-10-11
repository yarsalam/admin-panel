import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function AdminVerifyMiddleware(request: NextRequest) {
  const token =
    request.cookies.get("admin-token") ||
    request.headers.get("authorization")?.split(" ")[1];
  if (
    !token &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.startsWith("/set-password")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
