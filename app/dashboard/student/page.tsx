import StudentDashboard from "@/components/dashboard/student/dashboard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
// Force TS reload

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

interface InvoiceInfo {
  id: number;
  invoiceNumber: string;
  dueDate: Date;
  totalAmount: string;
}

interface Todo {
  id: number;
  task: string;
  isCompleted: boolean;
  createdDate: Date;
}

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getStudentDashboardData(userId: string) {
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 4);
  fiveDaysAgo.setHours(0, 0, 0, 0);

  const [enrollments, allProgress, weeklyActivity, todos, invoices, certificates, userInfo, allUsersByPoints, allBadges, userBadges] = await Promise.all([
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
    db.todo.findMany({
      where: { userId, isDeleted: 0 },
      orderBy: { createdDate: "desc" },
    }),
    db.invoice.findMany({
      where: { userId, invoiceStatus: "pending", isDeleted: 0 },
      select: { id: true, invoiceNumber: true, dueDate: true, totalAmount: true },
    }),
    db.certificate.findMany({
      where: { enrollment: { userId }, isDeleted: 0 },
      include: { enrollment: { include: { course: { select: { title: true } } } } },
      orderBy: { createdDate: "desc" },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { points: true, streak: true },
    }),
    db.user.findMany({
      where: { isDeleted: 0, points: { gt: 0 } },
      orderBy: { points: "desc" },
      select: { id: true },
    }),
    (db as any).badge.findMany({
      where: { status: 1, isDeleted: 0 },
      orderBy: { id: "asc" }
    }),
    (db as any).userBadge.findMany({
      where: { userId, isDeleted: 0 },
      include: { badge: true },
      orderBy: { earnedAt: "desc" }
    })
  ]);

  const userIndex = allUsersByPoints.findIndex((u: { id: string }) => u.id === userId);
  const rank = userIndex !== -1 ? userIndex + 1 : "-";

  const userStats = {
    points: userInfo?.points || 0,
    streak: userInfo?.streak || 0,
    rank,
  };

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

  return { 
    enrolledCourses, 
    weeklyHours, 
    avgProgress, 
    todos, 
    pendingInvoices: invoices.map((inv: any) => ({ ...inv, totalAmount: inv.totalAmount.toString() })),
    certificates: certificates.map((c: any) => ({
      id: c.id,
      courseTitle: c.enrollment.course.title,
      date: c.createdDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
    })),
    userStats,
    allBadges,
    userBadges
  };
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function StudentPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const { enrolledCourses, weeklyHours, avgProgress, todos, pendingInvoices, certificates, userStats, allBadges, userBadges } =
    await getStudentDashboardData(session.user.id);

  return (
    <StudentDashboard
      userId={session.user.id}
      userName={session.user.name}
      userEmail={session.user.email}
      userRole="Student"
      twoFactorEnabled={(session.user as any).twoFactorEnabled ?? false}
      enrolledCourses={enrolledCourses}
      weeklyHours={weeklyHours}
      avgProgress={avgProgress}
      todos={todos.map((t: any) => ({
        id: t.id,
        task: t.task,
        done: t.isCompleted,
        date: t.createdDate.toLocaleDateString("id-ID", { day: "numeric", month: "long" })
      }))}
      pendingInvoices={pendingInvoices}
      certificates={certificates}
      userStats={userStats}
      allBadges={allBadges}
      userBadges={userBadges}
    />
  );
}