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
    return NextResponse.json({ error: "Only admins can update withdrawals" }, { status: 403 });
  }

  const { id } = await params;
  const withdrawalId = parseInt(id, 10);

  try {
    const { status, note } = await req.json();

    const withdrawal = await (db as any).withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status,
        note: note || undefined,
        lastUpdatedBy: session.user.name || "Admin",
        lastUpdatedDate: new Date(),
      }
    });

    return NextResponse.json({ success: true, withdrawal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
