import { NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request, context: any) {
  try {
    const params = await context.params;
    const quizId = parseInt(params.quizId);
    const body = await request.json();
    const { content, type, points, order, options } = body;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { course: true }
    });

    if (!quiz || quiz.isDeleted === 1) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const roleId = (session.user as any).roleId;
    if (roleId !== 1 && quiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create question and options in a transaction
    const newQuestion = await prisma.question.create({
      data: {
        quizId,
        content,
        type: type || "MULTIPLE_CHOICE",
        points: points !== undefined ? parseInt(points) : 10,
        order: order !== undefined ? parseInt(order) : 0,
        createdBy: session.user.name || "SYSTEM",
        options: {
          create: options.map((opt: any) => ({
            content: opt.content,
            isCorrect: opt.isCorrect || false,
            createdBy: session.user.name || "SYSTEM",
          }))
        }
      },
      include: {
        options: true
      }
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Create question error:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
