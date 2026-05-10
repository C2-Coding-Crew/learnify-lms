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

export async function GET() {
  const guard = await guardAdmin();
  if ("error" in guard) return guard;

  const categories = await db.category.findMany({
    where: { isDeleted: 0 },
    orderBy: { createdDate: "desc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const guard = await guardAdmin();
  if ("error" in guard) return guard;

  try {
    const { name, slug, status } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const existing = await db.category.findUnique({ where: { slug } });
    if (existing && existing.isDeleted === 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        status: status !== undefined ? status : 1,
        createdBy: guard.user.name || "ADMIN",
        lastUpdatedBy: guard.user.name || "ADMIN",
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
