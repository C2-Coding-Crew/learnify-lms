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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await guardAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { name, email, status } = await req.json();

    const updatedUser = await db.user.update({
      where: { id },
      data: {
        name,
        email: email?.toLowerCase(),
        status: status !== undefined ? Number(status) : undefined,
        lastUpdatedBy: user.name || "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await guardAdmin();
  if (!user) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const deletedUser = await db.user.update({
      where: { id },
      data: {
        isDeleted: 1,
        status: 0,
        lastUpdatedBy: user.name || "ADMIN",
      },
    });

    return NextResponse.json({ success: true, user: deletedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
