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

  const [instructorCourses, ratingAggregate, recentEnrollments, recentReviews] =
    await Promise.all([
      // All courses by this instructor
      db.course.findMany({
        where: { instructorId, isDeleted: 0 },
        include: {
          _count: { select: { enrollments: { where: { isDeleted: 0 } } } },
        },
        orderBy: { createdDate: "desc" },
      }),

      // Average rating across all instructor's courses
      db.course.aggregate({
        where: { instructorId, isDeleted: 0 },
        _avg: { rating: true },
      }),

      // Enrollments per month (last 6 months) for revenue estimation
      db.enrollment.findMany({
        where: {
          isDeleted: 0,
          createdDate: { gte: sixMonthsAgo },
          course: { instructorId, isDeleted: 0 },
        },
        include: { course: { select: { price: true } } },
      }),

      // Latest 5 reviews on instructor's courses
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

  // ── Format courses ────────────────────────────────────────────────────────
  let totalRevenue = 0;
  const formattedCourses = instructorCourses.map((course: any) => {
    const revenue = Number(course.price) * course._count.enrollments;
    totalRevenue += revenue;
    return {
      id: course.id,
      title: course.title,
      students: course._count.enrollments,
      rating: course.rating,
      revenue: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(revenue),
      active: course.isPublished,
    };
  });

  // ── Monthly earnings (last 6 months, estimated from enrollment dates) ─────
  const monthlyMap: Record<string, number> = {};
  recentEnrollments.forEach((enr: any) => {
    const key = (enr.createdDate as Date).toISOString().slice(0, 7);
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(enr.course.price);
  });

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
    createdDate: (r.createdDate as Date).toISOString(),
  }));

  return {
    formattedCourses,
    totalRevenue,
    monthlyEarnings,
    avgRating,
    recentReviews: formattedReviews,
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
      twoFactorEnabled={(session.user as any).twoFactorEnabled ?? false}
    />
  );
}