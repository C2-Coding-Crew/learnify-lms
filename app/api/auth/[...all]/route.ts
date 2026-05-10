import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

const authLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 1000,
  limit: 5, // max 5 attempts per IP per minute
});

const handler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  const response = await handler.GET(request);
  return handleAuthInterceptor(request, response);
}

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  if (pathname.includes("/sign-in") || pathname.includes("/sign-up") || pathname.includes("/two-factor")) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const { success } = await authLimiter.check(5, ip);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  }

  // DEBUG: Log semua POST requests ke /api/auth
  console.log(`[auth endpoint] POST ${pathname}`);
  
  const response = await handler.POST(request);
  
  // DEBUG: Log response status dan cookies
  console.log(`[auth endpoint] Response status: ${response.status}`);
  if (pathname.includes("/sign-in")) {
    const setCookieHeader = response.headers.get("set-cookie");
    console.log(`[auth endpoint] Set-Cookie header present: ${!!setCookieHeader}`);
  }
  
  return handleAuthInterceptor(request, response);
}

// ── Interceptor untuk mengatasi bypass 2FA pada OAuth ──
function handleAuthInterceptor(request: NextRequest, response: Response): Response {
  const pathname = request.nextUrl.pathname;
  
  // Jika ini adalah request verifikasi 2FA yang BERHASIL (status 200 OK)
  if (
    response.status === 200 &&
    (pathname.includes("/two-factor/verify-totp") ||
     pathname.includes("/two-factor/verify-otp") ||
     pathname.includes("/two-factor/verify-backup-code"))
  ) {
    const resHeaders = new Headers(response.headers);
    // Kita set custom cookie agar middleware/layout tahu mereka sudah verifikasi 2FA 
    // selama sesi ini. Ini menambal celah OAuth bypass.
    resHeaders.append(
      "Set-Cookie",
      `2fa_verified=true; Path=/; Max-Age=2592000; HttpOnly; SameSite=Lax${
        process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );
    return new NextResponse(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  }

  // Jika logout, bersihkan juga cookie 2fa_verified
  if (pathname.includes("/sign-out") && response.status === 200) {
    const resHeaders = new Headers(response.headers);
    resHeaders.append(
      "Set-Cookie",
      `2fa_verified=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    );
    return new NextResponse(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  }

  return response;
}
