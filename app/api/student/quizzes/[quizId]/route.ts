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
              where: { isDeleted: 0 },
              select: {
                id: true,
                content: true,
                // isCorrect is EXCLUDED for students
              }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!quiz || quiz.isDeleted === 1 || quiz.status === 0) {
      return NextResponse.json({ error: "Quiz not found or inactive" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Get quiz for student error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
