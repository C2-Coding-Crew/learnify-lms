import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// GET /api/auth/sign-out
// Normal sign-out yang dipanggil oleh tombol logout di dashboard.
// Menghapus session dari DB dan cookie, lalu redirect ke /auth/login tanpa error.
export async function GET(request: Request) {
  const reqHeaders = await headers();

  try {
    await auth.api.signOut({ headers: reqHeaders });
  } catch {
    // Tetap lanjut meski signOut gagal — cookie tetap dihapus di bawah
  }

  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/auth/login", origin));

  // Hapus semua cookie terkait session
  response.cookies.delete("better-auth.session_token");
  response.cookies.delete("2fa_verified");
  response.cookies.delete("2fa_required");

  return response;
}
