import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    const url = new URL("/auth/login?error=session_invalid", request.url);
    const response = NextResponse.redirect(url);
    
    // Hapus semua cookie yang berkaitan dengan sesi Better Auth
    for (const cookie of allCookies) {
        if (cookie.name.includes("better-auth")) {
            response.cookies.delete(cookie.name);
        }
    }
    
    return response;
}
