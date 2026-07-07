import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/cadastro",
  "/buscar",
  "/grupos",
  "/parceiros",
  "/agenda",
  "/ranking",
  "/api/auth"
]);

const AUTH_ONLY_ROUTES = [
  "/dashboard",
  "/perfil",
  "/notificacoes",
  "/check-in",
  "/comunidade",
  "/api/v1/check-in",
  "/api/v1/attendance"
];

const ADMIN_ONLY_ROUTES = [
  "/dashboard/admin",
  "/api/v1/admin"
];

const LEADER_OR_ADMIN_ROUTES = [
  "/dashboard/grupo"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/static")) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const isPublicRoute = Array.from(PUBLIC_ROUTES).some((route) => pathname === route || pathname.startsWith(route + "/"));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const isLeaderRoute = LEADER_OR_ADMIN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  const authToken = request.cookies.get("authjs.session-token")?.value
    ?? request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!authToken && (isAuthRoute || isAdminRoute || isLeaderRoute)) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
