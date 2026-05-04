import { NextResponse, type NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "@/lib/auth";

// ─── Route groups ────────────────────────────────────────────────────────────
const PROTECTED_PREFIXES = ["/dashboard", "/auth/setup-2fa", "/auth/select-role", "/checkout"];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 1. Proteksi route yang butuh login ─────────────────────────────────────
    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (!isProtected) {
        return NextResponse.next();
    }

    // Cek session ke endpoint internal Better Auth
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: { cookie: request.headers.get("cookie") || "" },
        }
    );

    // Guard: Jika belum login dan mencoba masuk area terproteksi
    if (!session) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Guard: Cek 2FA jika aktif
    if (session.user.twoFactorEnabled) {
        // Better Auth 2FA plugin biasanya punya helper, atau kita cek cookie custom jika ada
        const isVerified = request.cookies.get("2fa_verified")?.value === "true";
        if (!isVerified && !pathname.startsWith("/auth/two-factor")) {
            return NextResponse.redirect(new URL("/auth/two-factor", request.url));
        }
    }

    // 2. Filter Berdasarkan Role (RBAC) ───────────────────────────────────────
    const roleId = session.user.roleId; // 1 = Admin, 2 = Student, 3 = Instructor

    // Jika mencoba mengakses root /dashboard, kita arahkan ke dashboard yang sesuai
    if (pathname === "/dashboard") {
        if (roleId === 1) return NextResponse.redirect(new URL("/dashboard/admin", request.url));
        if (roleId === 3) return NextResponse.redirect(new URL("/dashboard/instructor", request.url));
        return NextResponse.redirect(new URL("/dashboard/student", request.url));
    }

    // Tolak akses admin area jika bukan admin
    if (pathname.startsWith("/dashboard/admin") && roleId !== 1) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Tolak akses instructor area jika bukan instructor
    if (pathname.startsWith("/dashboard/instructor") && roleId !== 3) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Tolak akses student area jika bukan student (optional, admin mungkin bisa lihat)
    if (pathname.startsWith("/dashboard/student") && roleId !== 2) {
        // Biarkan Admin mengakses dashboard student (opsional) - tapi untuk instruktur tolak
        if (roleId !== 1) {
            return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api/auth|api/payment/midtrans/notification|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)).*)",
    ],
};
