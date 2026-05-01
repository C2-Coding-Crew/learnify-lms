import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const res = await auth.handler(request);
    if (!res) {
      console.log("[better-auth] returned undefined for POST", request.nextUrl.pathname);
      return NextResponse.json({ error: "Not found by better-auth" }, { status: 404 });
    }
    return res;
  } catch (error: any) {
    console.error("[better-auth] caught error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const res = await auth.handler(request);
    if (!res) {
      console.log("[better-auth] returned undefined for GET", request.nextUrl.pathname);
      return NextResponse.json({ error: "Not found by better-auth" }, { status: 404 });
    }
    return res;
  } catch (error: any) {
    console.error("[better-auth] caught error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
