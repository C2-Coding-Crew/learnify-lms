import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export async function POST(request: Request, context: any) {
  try {
    const params = await context.params;
    const { id } = params;
    const courseId = parseInt(id);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && existingCourse.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, videoUrl, isFree, duration } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Find the max order
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });
    
    const newOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        description: description || "",
        videoUrl,
        isFree: isFree || false,
        duration: duration ? parseInt(duration) : 0,
        order: newOrder,
      }
    });

    // Update course total minutes and total lessons
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalLessons: { increment: 1 },
        totalMinutes: { increment: lesson.duration }
      }
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 });
  }
}
