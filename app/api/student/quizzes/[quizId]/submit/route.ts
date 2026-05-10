import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";

const prisma = new PrismaClient();

const submitLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 users per minute
  limit: 3, // Max 3 submissions per minute per user
});

export async function POST(request: Request, context: any) {
  try {
    const params = await context.params;
    const quizId = parseInt(params.quizId);
    const body = await request.json();
    const { answers } = body; // Array of { questionId: number, selectedOptionId: number }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const { success } = await submitLimiter.check(3, session.user.id);
    if (!success) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Silakan tunggu beberapa saat." }, { status: 429 });
    }

    const quiz = await (prisma as any).quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true
          }
        }
      }
    });

    if (!quiz || quiz.isDeleted === 1) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let correctAnswersCount = 0;
    const totalQuestions = quiz.questions.length;

    if (totalQuestions === 0) {
      return NextResponse.json({ error: "Quiz has no questions" }, { status: 400 });
    }

    quiz.questions.forEach((question: any) => {
      const studentAnswer = answers.find((a: any) => a.questionId === question.id);
      const correctOption = question.options.find((o: any) => o.isCorrect);
      
      if (studentAnswer && studentAnswer.selectedOptionId === correctOption?.id) {
        correctAnswersCount++;
      }
    });

    const score = (correctAnswersCount / totalQuestions) * 100;
    const isPassed = score >= quiz.passingScore;

    const attempt = await (prisma as any).quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
        score,
        isPassed,
        createdBy: session.user.name || "SYSTEM",
      }
    });

    // Award points if passed
    if (isPassed) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          points: { increment: 50 } // Fixed points for passing a quiz
        }
      });
    }

    // Award QUIZ_MASTER badge if score is 100
    let earnedBadge = null;
    if (score === 100) {
      const quizMasterBadge = await (prisma as any).badge.findUnique({
        where: { criteria: 'QUIZ_MASTER' }
      });
      
      if (quizMasterBadge) {
        // Check if user already has it
        const existingBadge = await (prisma as any).userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: session.user.id,
              badgeId: quizMasterBadge.id
            }
          }
        });

        if (!existingBadge) {
          await (prisma as any).userBadge.create({
            data: {
              userId: session.user.id,
              badgeId: quizMasterBadge.id,
              createdBy: session.user.name || "SYSTEM",
            }
          });
          earnedBadge = quizMasterBadge;
        }
      }
    }

    return NextResponse.json({
      score,
      isPassed,
      correctAnswersCount,
      totalQuestions,
      attemptId: attempt.id,
      earnedBadge
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
