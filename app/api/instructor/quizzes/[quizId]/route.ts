import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params;
    const quizId = parseInt(params.quizId);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          where: { isDeleted: 0 },
          include: {
            options: {
              where: { isDeleted: 0 }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!quiz || quiz.isDeleted === 1) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Get quiz details error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz details" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: any) {
  try {
    const params = await context.params;
    const quizId = parseInt(params.quizId);
    const body = await request.json();
    const { title, description, timeLimit, passingScore, lessonId } = body;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true }
    });

    if (!existingQuiz || existingQuiz.isDeleted === 1) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && existingQuiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: title !== undefined ? title : existingQuiz.title,
        description: description !== undefined ? description : existingQuiz.description,
        timeLimit: timeLimit !== undefined ? parseInt(timeLimit) : existingQuiz.timeLimit,
        passingScore: passingScore !== undefined ? parseInt(passingScore) : existingQuiz.passingScore,
        lessonId: lessonId !== undefined ? (lessonId ? parseInt(lessonId) : null) : existingQuiz.lessonId,
        lastUpdatedBy: session.user.name || "SYSTEM",
      }
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    console.error("Update quiz error:", error);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const params = await context.params;
    const quizId = parseInt(params.quizId);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true }
    });

    if (!existingQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && existingQuiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.quiz.update({
      where: { id: quizId },
      data: { 
        isDeleted: 1,
        lastUpdatedBy: session.user.name || "SYSTEM",
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete quiz error:", error);
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}
