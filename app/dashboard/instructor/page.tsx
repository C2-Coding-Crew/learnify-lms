import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorDashboard from "@/components/dashboard/instructor/instructor";
import { db } from "@/lib/db";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MonthlyEarning {
  month: string;
  amount: number;
}

interface RecentReview {
  id: number;
  studentName: string;
  studentImage: string | null;
  courseTitle: string;
  rating: number;
  comment: string | null;
  createdDate: string;
}

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getInstructorDashboardData(instructorId: string) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [instructorCourses, ratingAggregate, paidInvoices, recentReviews] =
    await Promise.all([
      // 1. All courses by this instructor with active enrollment counts
      db.course.findMany({
        where: { instructorId, isDeleted: 0 },
        include: {
          _count: { select: { enrollments: { where: { isDeleted: 0, enrollmentStatus: "active" } } } },
        },
        orderBy: { createdDate: "desc" },
      }),

      // 2. Average rating across all instructor's courses
      db.course.aggregate({
        where: { instructorId, isDeleted: 0 },
        _avg: { rating: true },
      }),

      // 3. Real revenue from paid invoices
      (db as any).invoice.findMany({
        where: {
          invoiceStatus: "paid",
          course: { instructorId, isDeleted: 0 },
          lastUpdatedDate: { gte: sixMonthsAgo },
        },
        select: { totalAmount: true, lastUpdatedDate: true, courseId: true },
      }),

      // 4. Latest 5 reviews on instructor's courses
      db.review.findMany({
        where: {
          isDeleted: 0,
          status: 1,
          course: { instructorId, isDeleted: 0 },
        },
        include: {
          user: { select: { name: true, image: true } },
          course: { select: { title: true } },
        },
        orderBy: { createdDate: "desc" },
        take: 5,
      }),
    ]);

  // ── Calculate Revenue ──────────────────────────────────────────────────────
  const revenuePerCourse: Record<number, number> = {};
  let totalRevenueCount = 0;
  const monthlyMap: Record<string, number> = {};

  paidInvoices.forEach((inv: any) => {
    const amount = Number(inv.totalAmount);
    totalRevenueCount += amount;
    
    if (inv.courseId) {
      revenuePerCourse[inv.courseId] = (revenuePerCourse[inv.courseId] ?? 0) + amount;
    }

    const monthKey = inv.lastUpdatedDate.toISOString().slice(0, 7);
    monthlyMap[monthKey] = (monthlyMap[monthKey] ?? 0) + amount;
  });

  // ── Format courses ────────────────────────────────────────────────────────
  const formattedCourses = instructorCourses.map((course: any) => ({
    id: course.id,
    title: course.title,
    students: course._count.enrollments,
    rating: course.rating,
    revenue: new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(revenuePerCourse[course.id] ?? 0),
    active: course.isPublished,
  }));

  // ── Monthly earnings (last 6 months, from real paid invoices) ──────────────
  const monthlyEarnings: MonthlyEarning[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });
    return { month: label, amount: monthlyMap[key] ?? 0 };
  });

  // ── Average rating ────────────────────────────────────────────────────────
  const avgRating = ratingAggregate._avg.rating ?? 0;

  // ── Recent reviews ────────────────────────────────────────────────────────
  const formattedReviews: RecentReview[] = recentReviews.map((r: any) => ({
    id: r.id,
    studentName: r.user.name,
    studentImage: r.user.image,
    courseTitle: r.course.title,
    rating: r.rating,
    comment: r.comment,
    createdDate: r.createdDate.toISOString(),
  }));

  // ── Calculate Stats ───────────────────────────────────────────────────────
  const totalStudentsCount = instructorCourses.reduce((sum, c) => sum + c._count.enrollments, 0);

  // 5. Pending gradings (submissions with no grade)
  const pendingGradings = await (db as any).submission.count({
    where: {
      grade: null,
      assignment: { course: { instructorId, isDeleted: 0 } },
      isDeleted: 0,
      status_code: 1,
    },
  });

  return {
    formattedCourses,
    totalRevenue: totalRevenueCount,
    monthlyEarnings,
    avgRating,
    recentReviews: formattedReviews,
    totalStudents: totalStudentsCount,
    pendingGradingsCount: pendingGradings,
  };
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function InstructorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const {
    formattedCourses,
    totalRevenue,
    monthlyEarnings,
    avgRating,
    recentReviews,
    totalStudents,
    pendingGradingsCount,
  } = await getInstructorDashboardData(session.user.id);

  return (
    <InstructorDashboard
      userName={session.user.name}
      userEmail={session.user.email}
      userRole="Instructor"
      courses={formattedCourses}
      totalRevenue={totalRevenue}
      monthlyEarnings={monthlyEarnings}
      avgRating={avgRating}
      recentReviews={recentReviews}
      totalStudents={totalStudents}
      pendingGradingsCount={pendingGradingsCount}
      twoFactorEnabled={(session.user as any).twoFactorEnabled ?? false}
    />
  );
}
