import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

const COMPANY = "LEARNIFY";

// ─── POST /api/progress — Simpan progress lesson user ───────────────────────
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { lessonId, isCompleted, watchedSecs = 0 } = body;

  if (!lessonId || typeof lessonId !== "number") {
    return NextResponse.json({ error: "lessonId wajib diisi" }, { status: 400 });
  }

  // Validasi lesson ada
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, isDeleted: 0, status: 1 },
    select: { id: true, courseId: true },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson tidak ditemukan" }, { status: 404 });
  }

  // Validasi user sudah enroll kursus ini
  const enrollment = await db.enrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId: lesson.courseId,
      isDeleted: 0,
    },
  });

  if (!enrollment) {
    return NextResponse.json({ error: "Kamu belum terdaftar di kursus ini" }, { status: 403 });
  }

  // Upsert progress (update jika ada, create jika belum)
  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
  });

  const progress = existing
    ? await db.lessonProgress.update({
        where: { userId_lessonId: { userId: session.user.id, lessonId } },
        data: {
          isCompleted: isCompleted ?? existing.isCompleted,
          completedAt: isCompleted && !existing.isCompleted ? new Date() : existing.completedAt,
          watchedSecs: Math.max(watchedSecs, existing.watchedSecs),
          lastUpdatedBy: session.user.id,
          lastUpdatedDate: new Date(),
        },
      })
    : await db.lessonProgress.create({
        data: {
          userId: session.user.id,
          lessonId,
          isCompleted: isCompleted ?? false,
          completedAt: isCompleted ? new Date() : null,
          watchedSecs,
          companyCode: COMPANY,
          status: 1,
          isDeleted: 0,
          createdBy: session.user.id,
          createdDate: new Date(),
          lastUpdatedBy: session.user.id,
          lastUpdatedDate: new Date(),
        },
      });

  // Cek apakah kursus selesai 100%
  const [completedCount, totalLessons] = await Promise.all([
    db.lessonProgress.count({
      where: {
        userId: session.user.id,
        lesson: { courseId: lesson.courseId },
        isCompleted: true,
        isDeleted: 0,
      },
    }),
    db.lesson.count({
      where: { courseId: lesson.courseId, isDeleted: 0, status: 1 },
    }),
  ]);

  const isCourseCompleted = completedCount === totalLessons;

  // Jika kursus selesai, update enrollment status
  if (isCourseCompleted) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        enrollmentStatus: "completed",
        completedAt: new Date(),
        lastUpdatedBy: session.user.id,
        updatedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    success: true,
    progress,
    stats: {
      completedCount,
      totalLessons,
      progressPercent: Math.round((completedCount / totalLessons) * 100),
      isCourseCompleted,
    },
  });
}
