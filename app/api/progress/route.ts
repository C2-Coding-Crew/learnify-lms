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

  // Jika kursus selesai, update enrollment status dan berikan sertifikat
  if (isCourseCompleted && (!existing || !existing.isCompleted) && isCompleted) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        enrollmentStatus: "completed",
        completedAt: new Date(),
        lastUpdatedBy: session.user.id,
        lastUpdatedDate: new Date(),
      },
    });

    // Generate Certificate
    const certExists = await db.certificate.findUnique({
      where: { enrollmentId: enrollment.id }
    });

    if (!certExists) {
      const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const year = new Date().getFullYear();
      const certNumber = `LRNFY-CERT-${year}-${randomId}`;

      await db.certificate.create({
        data: {
          enrollmentId: enrollment.id,
          certificateNumber: certNumber,
          createdBy: "SYSTEM",
        }
      });
    }
  }

  // ── Gamification: Points & Streaks ───────────────────────────────────────
  // Update points and streak ONLY if this is a NEW completion
  if (isCompleted && (!existing || !existing.isCompleted)) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { points: true, streak: true, lastStudyDate: true } as any,
    });

    if (user) {
      const now = new Date();
      const lastStudy = (user as any).lastStudyDate ? new Date((user as any).lastStudyDate) : null;
      let newStreak = (user as any).streak;

      if (!lastStudy) {
        newStreak = 1;
      } else {
        const diffInDays = Math.floor((now.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 1) {
          // Belajar hari ini dan kemarin (streak berlanjut)
          newStreak += 1;
        } else if (diffInDays > 1) {
          // Bolong belajar (reset streak)
          newStreak = 1;
        }
        // Jika diffInDays === 0 (sudah belajar hari ini), streak tidak berubah
      }

      await db.user.update({
        where: { id: session.user.id },
        data: {
          points: ((user as any).points || 0) + 10, // Tambah 10 poin per lesson
          streak: newStreak,
          lastStudyDate: now,
        },
      } as any);

      // Award STREAK_7_DAYS badge
      if (newStreak === 7) {
        const streakBadge = await (db as any).badge.findUnique({ where: { criteria: 'STREAK_7_DAYS' } });
        if (streakBadge) {
          const hasBadge = await (db as any).userBadge.findUnique({
            where: { userId_badgeId: { userId: session.user.id, badgeId: streakBadge.id } }
          });
          if (!hasBadge) {
            await (db as any).userBadge.create({
              data: { userId: session.user.id, badgeId: streakBadge.id, createdBy: "SYSTEM" }
            });
          }
        }
      }
    }
  }

  // Award COURSE_COMPLETER badge if course just completed
  if (isCourseCompleted && (!existing || !existing.isCompleted) && isCompleted) {
    const completerBadge = await (db as any).badge.findUnique({ where: { criteria: 'COURSE_COMPLETER' } });
    if (completerBadge) {
      const hasBadge = await (db as any).userBadge.findUnique({
        where: { userId_badgeId: { userId: session.user.id, badgeId: completerBadge.id } }
      });
      if (!hasBadge) {
        await (db as any).userBadge.create({
          data: { userId: session.user.id, badgeId: completerBadge.id, createdBy: "SYSTEM" }
        });
      }
    }
  }

  return NextResponse.json({
    success: true,
    progress: {
      ...progress,
      id: progress.id.toString(),
    },
    stats: {
      completedCount,
      totalLessons,
      progressPercent: Math.round((completedCount / totalLessons) * 100),
      isCourseCompleted,
    },
  });
}
