import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 1) {
    return NextResponse.json({ error: "Only admins can access this" }, { status: 403 });
  }

  try {
    const withdrawals = await (db as any).withdrawal.findMany({
      where: { isDeleted: 0 },
      include: {
        instructor: {
          select: { name: true, email: true, image: true }
        }
      },
      orderBy: { createdDate: "desc" },
    });

    return NextResponse.json(withdrawals);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
