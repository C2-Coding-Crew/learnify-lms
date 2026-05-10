import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params;
    const courseId = parseInt(params.id);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { courseId, isDeleted: 0 },
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdDate: 'desc' }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Get quizzes error:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(request: Request, context: any) {
  try {
    const params = await context.params;
    const courseId = parseInt(params.id);
    const body = await request.json();
    const { title, description, timeLimit, passingScore, lessonId } = body;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        lessonId: lessonId ? parseInt(lessonId) : null,
        title,
        description,
        timeLimit: timeLimit ? parseInt(timeLimit) : null,
        passingScore: passingScore ? parseInt(passingScore) : 70,
        createdBy: session.user.name || "SYSTEM",
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Create quiz error:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
