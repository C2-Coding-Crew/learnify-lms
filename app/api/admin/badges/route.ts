import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

const COMPANY = "LEARNIFY";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const badges = await (db as any).badge.findMany({
      where: { isDeleted: 0 },
      orderBy: { createdDate: "desc" },
    });

    return NextResponse.json(badges);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, imageUrl, criteria, pointsRequired } = body;

    const badge = await (db as any).badge.create({
      data: {
        name,
        description,
        imageUrl,
        criteria,
        pointsRequired: parseInt(pointsRequired) || 0,
        companyCode: COMPANY,
        createdBy: session.user.name || "Admin",
        lastUpdatedBy: session.user.name || "Admin",
      }
    });

    return NextResponse.json({ success: true, badge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
