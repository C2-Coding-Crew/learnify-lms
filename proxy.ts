import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy (Middleware) yang lebih sederhana dan reliabel menggunakan konvensi Next.js terbaru.
 * Daripada fetch session (fragile di Edge runtime), kita langsung cek cookie.
 *
 * Better Auth cookies:
 * - "better-auth.session_token"  → user sudah login
 * - "better-auth.two_factor"     → 2FA pending (harus verifikasi dulu)
 *
 * Proteksi yang diterapkan:
 * 1. /dashboard → harus login (ada session cookie)
 * 2. /dashboard → jika 2FA pending → arahkan ke /auth/two-factor
 * 3. /auth/login, /auth/register → jika sudah login → arahkan ke /dashboard
 * 4. /auth/two-factor → hanya bisa diakses jika ada 2FA pending cookie
 */

const SESSION_COOKIE = "better-auth.session_token";
const TWO_FACTOR_COOKIE = "better-auth.two_factor";

const DASHBOARD_PREFIX = "/dashboard";
const AUTH_ROUTES = ["/auth/login", "/auth/register"];
const TWO_FACTOR_ROUTE = "/auth/two-factor";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Skip: API routes & static files ─────────────────────────────────────────
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.match(/\.(.+)$/) // file extensions
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const twoFactorPending = request.cookies.get(TWO_FACTOR_COOKIE)?.value;

  const isAuthenticated = !!sessionToken;
  const has2FAPending = !!twoFactorPending;

  // HANYA LOG JIKA BUKAN STATIC FILES UNTUK DEBUG
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth/")) {
    console.log(`[Proxy] Path: ${pathname}`);
    console.log(`  - Has Session Cookie: ${isAuthenticated}`);
    console.log(`  - Has 2FA Pending Cookie: ${has2FAPending}`);
  }

  // ── (1) Akses /dashboard tanpa session → redirect ke login ──────────────────
  if (!isAuthenticated && pathname.startsWith(DASHBOARD_PREFIX)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── (2) Akses /dashboard dengan 2FA pending → redirect ke 2FA page ─────────
  if (isAuthenticated && has2FAPending && pathname.startsWith(DASHBOARD_PREFIX)) {
    return NextResponse.redirect(new URL(TWO_FACTOR_ROUTE, request.url));
  }

  // ── (3) Sudah login + akses halaman auth (login/register) → ke dashboard ───
  if (isAuthenticated && !has2FAPending && AUTH_ROUTES.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── (4) Sudah login + 2FA pending + akses auth routes → ke 2FA page ─────────
  if (isAuthenticated && has2FAPending && AUTH_ROUTES.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL(TWO_FACTOR_ROUTE, request.url));
  }

  // ── (5) Akses /auth/two-factor → hanya jika ada 2FA pending ─────────────────
  if (pathname === TWO_FACTOR_ROUTE) {
    // Tidak ada pending & tidak ada session → ke login
    if (!isAuthenticated && !has2FAPending) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // Sudah verified (session ada, tidak ada pending) → ke dashboard
    if (isAuthenticated && !has2FAPending) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
