import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.roleId !== 2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcements = await (db as any).announcement.findMany({
      where: {
        course: { instructorId: session.user.id, isDeleted: 0 },
        isDeleted: 0
      },
      include: {
        course: { select: { title: true } }
      },
      orderBy: { createdDate: "desc" }
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Fetch announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.roleId !== 2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, title, content } = await request.json();

    if (!courseId || !title || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify course belongs to instructor
    const course = await db.course.findUnique({
      where: { id: parseInt(courseId) },
      select: { instructorId: true }
    });

    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const announcement = await (db as any).announcement.create({
      data: {
        courseId: parseInt(courseId),
        title,
        content,
        createdBy: session.user.name
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Create announcement error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
