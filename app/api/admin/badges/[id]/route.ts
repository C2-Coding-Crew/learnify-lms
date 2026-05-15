import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const badgeId = parseInt(id, 10);

  try {
    const body = await req.json();
    const { name, description, imageUrl, criteria, pointsRequired, status } = body;

    const badge = await (db as any).badge.update({
      where: { id: badgeId },
      data: {
        name: name || undefined,
        description: description || undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        criteria: criteria || undefined,
        pointsRequired: pointsRequired !== undefined ? parseInt(pointsRequired) : undefined,
        status: status !== undefined ? parseInt(status) : undefined,
        lastUpdatedBy: session.user.name || "Admin",
        lastUpdatedDate: new Date(),
      }
    });

    return NextResponse.json({ success: true, badge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const badgeId = parseInt(id, 10);

  try {
    await (db as any).badge.update({
      where: { id: badgeId },
      data: { isDeleted: 1, lastUpdatedBy: session.user.name || "Admin" }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
