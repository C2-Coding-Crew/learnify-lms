import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

async function guardAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const roleId = (session.user as any).roleId;
  if (roleId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { user: session.user };
}

export async function POST(req: NextRequest) {
  const guard = await guardAdmin();
  if ("error" in guard) return guard;

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
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        roleId: Number(roleId),
        status: status !== undefined ? Number(status) : 1,
        createdBy: guard.user.name || "ADMIN",
        lastUpdatedBy: guard.user.name || "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
