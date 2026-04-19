import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/auth/login", "/auth/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isLoggedIn = !!session?.user;
  
  // Casting 'as any' biar TS nggak rewel
  const is2FAEnabled = (session?.user as any)?.twoFactorEnabled;
  const is2FAVerified = (session?.session as any)?.twoFactorVerified;
  
  // LOGIKA BARU: Cek apakah butuh SETUP atau cuma VERIFIKASI
  const needsSetup = isLoggedIn && !is2FAEnabled; // Login tapi belum pernah scan QR
  const needsVerify = isLoggedIn && is2FAEnabled && !is2FAVerified; // Sudah aktif tapi sesi ini belum isi OTP

  // 1. --- PENGECUALIAN AGAR TIDAK LOOP ---
  if (pathname === "/auth/setup-2fa" || pathname === "/auth/verify-2fa") {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/auth/login", request.url));
    
    // Kalau sudah beres semua, jangan boleh di halaman setup/verify, lempar ke dashboard
    if (!needsSetup && !needsVerify) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. --- LOGIKA PROTEKSI DASHBOARD ---
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // PAKSA SETUP: Kalau login tapi belum pernah aktifin 2FA
    if (needsSetup) {
      return NextResponse.redirect(new URL("/auth/setup-2fa", request.url));
    }

    // PAKSA VERIFIKASI: Kalau sudah aktif tapi belum isi OTP di sesi ini
    if (needsVerify) {
      return NextResponse.redirect(new URL("/auth/verify-2fa", request.url));
    }
  }

  // 3. --- LOGIKA AUTH PAGES ---
  if (authRoutes.includes(pathname)) {
    if (isLoggedIn && !needsSetup && !needsVerify) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/auth/login", 
    "/auth/register", 
    "/auth/setup-2fa", // Tambahin ini
    "/auth/verify-2fa"
  ],
};