import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const reqHeaders = await headers();

  try {
    // Log out the user immediately after Google registration
    await auth.api.signOut({ headers: reqHeaders });
  } catch {
    // Ignore if signOut fails
  }

  // Redirect to login page
  const response = NextResponse.redirect(
    new URL("/auth/login?registered=true", new URL(request.url).origin)
  );

  // Force delete cookie session to ensure they are logged out
  response.cookies.delete("better-auth.session_token");
  
  return response;
}
