import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

const COMPANY = "LEARNIFY";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlists = await db.wishlist.findMany({
      where: { userId: session.user.id, isDeleted: 0 },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            level: true,
            rating: true,
            reviewCount: true,
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { createdDate: "desc" },
    });

    return NextResponse.json({ success: true, wishlists });
  } catch (error) {
    console.error("[WISHLIST_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const existing = await db.wishlist.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });

    if (existing) {
      if (existing.isDeleted === 1) {
        // Restore if previously soft deleted
        const restored = await db.wishlist.update({
          where: { id: existing.id },
          data: { isDeleted: 0, lastUpdatedBy: session.user.id, lastUpdatedDate: new Date() },
        });
        return NextResponse.json({ success: true, wishlist: restored });
      }
      return NextResponse.json({ error: "Already in wishlist" }, { status: 400 });
    }

    const wishlist = await db.wishlist.create({
      data: {
        userId: session.user.id,
        courseId,
        companyCode: COMPANY,
        createdBy: session.user.id,
        lastUpdatedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    console.error("[WISHLIST_POST]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseIdParam = searchParams.get("courseId");

    if (!courseIdParam) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

    const courseId = parseInt(courseIdParam, 10);

    const existing = await db.wishlist.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });

    if (!existing || existing.isDeleted === 1) {
      return NextResponse.json({ error: "Not found in wishlist" }, { status: 404 });
    }

    await db.wishlist.update({
      where: { id: existing.id },
      data: { isDeleted: 1, lastUpdatedBy: session.user.id, lastUpdatedDate: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WISHLIST_DELETE]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
