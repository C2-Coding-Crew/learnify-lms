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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardAdmin();
  if ("error" in guard) return guard;

  try {
    const { id } = await params;
    const { name, email, status } = await req.json();

    const user = await db.user.update({
      where: { id },
      data: {
        name,
        email: email?.toLowerCase(),
        status: status !== undefined ? Number(status) : undefined,
        lastUpdatedBy: guard.user.name || "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await guardAdmin();
  if ("error" in guard) return guard;

  try {
    const { id } = await params;

    const user = await db.user.update({
      where: { id },
      data: {
        isDeleted: 1,
        status: 0,
        lastUpdatedBy: guard.user.name || "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
