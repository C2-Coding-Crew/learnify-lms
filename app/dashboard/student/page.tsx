import StudentDashboard from "@/components/dashboard/student/dashboard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormattedCourse {
  id: number;
  slug: string;
  title: string;
  time: string;
  lessons: string;
  progress: number;
  active: boolean;
}

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getStudentDashboardData(userId: string) {
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4);
  fiveDaysAgo.setHours(0, 0, 0, 0);

  const [enrollments, allProgress, weeklyActivity] = await Promise.all([
    db.enrollment.findMany({
      where: { userId, isDeleted: 0 },
      include: {
        course: {
          include: {
            lessons: { where: { isDeleted: 0, status: 1 } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    }),
    db.lessonProgress.findMany({
      where: { userId, isDeleted: 0 },
    }),
    db.lessonProgress.findMany({
      where: { userId, isDeleted: 0, lastUpdatedDate: { gte: fiveDaysAgo } },
      select: { watchedSecs: true, lastUpdatedDate: true },
    }),
  ]);

  // ── Enrolled courses with real progress ───────────────────────────────────
  const enrolledCourses: FormattedCourse[] = enrollments.map((enr: any) => {
    const totalLessons = enr.course.lessons.length;
    const completedLessons = allProgress.filter(
      (p: any) =>
        p.isCompleted &&
        enr.course.lessons.some((l: any) => l.id === p.lessonId)
    ).length;

    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    const h = Math.floor(enr.course.totalMinutes / 60);
    const m = enr.course.totalMinutes % 60;
    const timeStr =
      h > 0 ? `${h}hrs${m > 0 ? ` ${m}m` : ""}` : `${m}m`;

    return {
      id: enr.course.id,
      slug: enr.course.slug,
      title: enr.course.title,
      time: timeStr,
      lessons: `${completedLessons}/${totalLessons} Lessons`,
      progress: progressPercent,
      active: progressPercent < 100,
    };
  });

  // ── Weekly study hours (last 5 days, in hours) ────────────────────────────
  const weeklyHours: number[] = Array.from({ length: 5 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (4 - i));
    const dayStr = day.toISOString().slice(0, 10);

    const totalSecs = weeklyActivity
      .filter(
        (p: any) =>
          (p.lastUpdatedDate as Date).toISOString().slice(0, 10) === dayStr
      )
      .reduce((sum: number, p: any) => sum + p.watchedSecs, 0);

    return Math.round((totalSecs / 3600) * 10) / 10; // hours, 1 decimal
  });

  // ── Average progress across all enrolled courses ──────────────────────────
  const avgProgress =
    enrolledCourses.length > 0
      ? Math.round(
          enrolledCourses.reduce((sum, c) => sum + c.progress, 0) /
            enrolledCourses.length
        )
      : 0;

  return { enrolledCourses, weeklyHours, avgProgress };
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function StudentPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const { enrolledCourses, weeklyHours, avgProgress } =
    await getStudentDashboardData(session.user.id);

  return (
    <StudentDashboard
      userId={session.user.id}
      userName={session.user.name}
      userEmail={session.user.email}
      userRole="Student"
      twoFactorEnabled={session.user.twoFactorEnabled ?? false}
      enrolledCourses={enrolledCourses}
      weeklyHours={weeklyHours}
      avgProgress={avgProgress}
    />
  );
}