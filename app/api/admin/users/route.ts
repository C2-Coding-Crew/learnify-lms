import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function guardAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || (session.user as any).roleId !== 1) {
    return null;
  }
  return session.user;
}

export async function POST(req: NextRequest) {
  const user = await guardAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, email, roleId, status } = await req.json();

    if (!name || !email || !roleId) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Buat user di database langsung (hanya bisa login via OAuth nantinya, kecuali admin set password via Better Auth API)
    const newUser = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        roleId: Number(roleId),
        status: status !== undefined ? Number(status) : 1,
        createdBy: user.name || "ADMIN",
        lastUpdatedBy: user.name || "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
