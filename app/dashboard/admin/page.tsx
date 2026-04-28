// app/dashboard/admin/page.tsx
import AdminDashboard from "@/components/dashboard/admin/admin";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function getAdminStats() {
  // Stats
  const [totalStudents, totalInstructors, totalActiveCourses, revenueAggregate, topCourses] =
    await Promise.all([
      db.user.count({ where: { roleId: 2, isDeleted: 0, status: 1 } }),
      db.user.count({ where: { roleId: 3, isDeleted: 0, status: 1 } }),
      db.course.count({ where: { isPublished: true, isDeleted: 0, status: 1 } }),
      db.invoice.aggregate({
        where: { invoiceStatus: "paid", isDeleted: 0, status: 1 },
        _sum: { totalAmount: true },
      }),
      db.course.findMany({
        where: { isDeleted: 0, status: 1 },
        select: {
          id: true,
          title: true,
          price: true,
          rating: true,
          reviewCount: true,
          category: { select: { name: true } },
          instructor: { select: { name: true } },
          _count: { select: { enrollments: { where: { isDeleted: 0 } } } },
        },
        orderBy: { enrollments: { _count: "desc" } },
        take: 5,
      }),
    ]);

  // Monthly revenue (6 bulan terakhir)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const paidInvoices = await db.invoice.findMany({
    where: { invoiceStatus: "paid", isDeleted: 0, createdDate: { gte: sixMonthsAgo } },
    select: { totalAmount: true, createdDate: true },
  });

  const monthlyMap: Record<string, number> = {};
  paidInvoices.forEach((inv) => {
    const key = inv.createdDate.toISOString().slice(0, 7);
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(inv.totalAmount);
  });

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    return { month: label, revenue: monthlyMap[key] ?? 0 };
  });

  return {
    stats: {
      totalStudents,
      totalInstructors,
      totalActiveCourses,
      totalRevenue: Number(revenueAggregate._sum.totalAmount ?? 0),
    },
    monthlyRevenue,
    topCourses: topCourses.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category.name,
      instructor: c.instructor.name,
      enrollments: c._count.enrollments,
      revenue: c._count.enrollments * Number(c.price),
      rating: c.rating,
      reviewCount: c.reviewCount,
    })),
  };
}

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  // Role guard — hanya admin
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { roleId: true },
  });
  if (dbUser?.roleId !== 1) redirect("/dashboard");

  const { stats, monthlyRevenue, topCourses } = await getAdminStats();

  return (
    <AdminDashboard
      userName={session.user.name}
      userEmail={session.user.email}
      userRole="Admin"
      twoFactorEnabled={session.user.twoFactorEnabled ?? false}
      stats={stats}
      monthlyRevenue={monthlyRevenue}
      topCourses={topCourses}
    />
  );
}