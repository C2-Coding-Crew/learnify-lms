import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/auth/sign-out-redirect
// Dipanggil saat session ada tapi user tidak ditemukan di DB.
// Menghapus session dari DB dan cookie, lalu redirect ke login.
export async function GET(request: Request) {
  const reqHeaders = await headers();

  try {
    await auth.api.signOut({ headers: reqHeaders });
  } catch {
    // Tetap lanjut meski signOut gagal
  }

  const response = NextResponse.redirect(
    new URL("/auth/login?error=session_invalid", new URL(request.url).origin)
  );

  // Force hapus cookie session agar middleware tidak loop
  response.cookies.delete("better-auth.session_token");
  response.cookies.delete("2fa_verified");
  response.cookies.delete("2fa_required");

  return response;
}
