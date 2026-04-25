import { NextRequest, NextResponse } from "next/server";

const AUTH_ROUTES = ["/auth/login", "/auth/register"];
const DASHBOARD_PREFIX = "/dashboard";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // SEMENTARA: Matikan semua logika redirect otomatis agar tidak looping
  // Biarkan user bisa mengakses halaman apa saja secara manual untuk debug
  
  return NextResponse.next();
}