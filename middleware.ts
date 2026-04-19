import { NextRequest, NextResponse } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

// ── Route groups ──────────────────────────────────────────────────────────────
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];
const TWO_FACTOR_ROUTE = "/auth/two-factor";
const DASHBOARD_PREFIX = "/dashboard";

// ── Session type dari Better Auth ─────────────────────────────────────────────
type Session = {
  user: {
    id: string;
    email: string;
    twoFactorEnabled?: boolean;
  };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes dan static files
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Ambil session dari Better Auth
  let session: Session | null = null;
  try {
    const { data } = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: request.nextUrl.origin,
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    session = data;
  } catch {
    session = null;
  }

  const isAuthenticated = !!session?.user;
  const has2FA = session?.user?.twoFactorEnabled ?? false;

  // ── Cek apakah ada TWO_FACTOR pending cookie ──────────────────────────────
  // Better Auth set cookie ini saat login berhasil tapi 2FA belum diverifikasi
  const twoFactorPending =
    request.cookies.get("better-auth.two-factor.pending")?.value;

  // ── Sudah login tapi akses route AUTH (login/register) → redirect ke dashboard
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    // Jika ada pending 2FA → redirect ke two-factor page
    if (twoFactorPending) {
      return NextResponse.redirect(new URL(TWO_FACTOR_ROUTE, request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Akses /dashboard tanpa login → redirect ke login ─────────────────────
  if (!isAuthenticated && pathname.startsWith(DASHBOARD_PREFIX)) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // ── Akses /dashboard tapi 2FA belum diverifikasi → redirect ke two-factor ─
  if (
    isAuthenticated &&
    has2FA &&
    twoFactorPending &&
    pathname.startsWith(DASHBOARD_PREFIX)
  ) {
    return NextResponse.redirect(new URL(TWO_FACTOR_ROUTE, request.url));
  }

  // ── Akses /auth/two-factor tanpa login atau tanpa pending → redirect ───────
  if (pathname === TWO_FACTOR_ROUTE) {
    if (!isAuthenticated && !twoFactorPending) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // User sudah verify 2FA (tidak ada pending) & masuk ke two-factor page → dashboard
    if (isAuthenticated && !twoFactorPending) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Matcher: semua halaman kecuali static files
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
