import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const { id, lessonId } = params;
    const courseId = parseInt(id);
    const parsedLessonId = parseInt(lessonId);

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

    const lesson = await prisma.lesson.findUnique({ where: { id: parsedLessonId } });
    if (!lesson || lesson.courseId !== courseId) {
      return NextResponse.json({ error: "Lesson not found in this course" }, { status: 404 });
    }

    await prisma.lesson.delete({
      where: { id: parsedLessonId }
    });

    // Update course total minutes and total lessons
    await prisma.course.update({
      where: { id: courseId },
      data: {
        totalLessons: { decrement: 1 },
        totalMinutes: { decrement: lesson.duration }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 });
  }
}
