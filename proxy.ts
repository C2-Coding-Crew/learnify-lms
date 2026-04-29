import { NextRequest, NextResponse } from "next/server";

// ─── Route groups ────────────────────────────────────────────────────────────
const PROTECTED_PREFIXES = ["/dashboard", "/auth/setup-2fa", "/auth/select-role", "/checkout"];

// Better Auth session cookie
const SESSION_COOKIE = "better-auth.session_token";

// ─── Proxy (Next.js 16+ menggantikan middleware.ts) ───────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = Boolean(sessionToken);

  // 1. Proteksi route yang butuh login ─────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // PENTING: Sengaja TIDAK redirect user yg sudah login dari /auth/login → /dashboard.
  // Alasan: jika dashboard/page.tsx redirect ke /auth/login (karena dbUser null),
  // dan proxy redirect balik ke /dashboard → infinite loop.
  // Login page akan handle redirect sendiri via session check.

  return NextResponse.next();
}

// ─── Matcher ─────────────────────────────────────────────────────────────────
export const config = {
  matcher: [
    "/((?!api/auth|api/payment/midtrans/notification|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)).*)",
  ],
};