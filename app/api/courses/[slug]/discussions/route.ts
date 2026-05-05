import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const courseId = parseInt(slug);

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const roleId = (session.user as any).roleId;

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isInstructor = course.instructorId === userId || roleId === 1;
    
    if (!isInstructor) {
      const enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        }
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Forbidden: You are not enrolled in this course" }, { status: 403 });
      }
    }

    const messages = await (db as any).courseDiscussion.findMany({
      where: { courseId, isDeleted: 0 },
      include: {
        user: { select: { id: true, name: true, image: true, roleId: true } }
      },
      orderBy: { createdDate: "asc" },
      take: 100
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fetch discussions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const courseId = parseInt(slug);
    const { message, fileUrl, fileType } = await request.json();

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    if (!message && !fileUrl) {
      return NextResponse.json({ error: "Message or file is required" }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const roleId = (session.user as any).roleId;

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isInstructor = course.instructorId === userId || roleId === 1;
    
    if (!isInstructor) {
      const enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId, courseId }
        }
      });
      if (!enrollment) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const newMessage = await (db as any).courseDiscussion.create({
      data: {
        courseId,
        userId,
        message,
        fileUrl,
        fileType
      },
      include: {
        user: { select: { id: true, name: true, image: true, roleId: true } }
      }
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
