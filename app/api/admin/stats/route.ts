import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
// Hanya bisa diakses oleh user dengan roleId === 1 (Admin)
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Cek role admin
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { roleId: true },
  });

  if (dbUser?.roleId !== 1) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ─── Aggregate Stats ────────────────────────────────────────────────────────
  const [
    totalStudents,
    totalInstructors,
    totalActiveCourses,
    revenueAggregate,
    topCourses,
  ] = await Promise.all([
    // Total students (roleId = 3)
    db.user.count({ where: { roleId: 3, isDeleted: 0, status: 1 } }),

    // Total instructors (roleId = 2)
    db.user.count({ where: { roleId: 2, isDeleted: 0, status: 1 } }),

    // Total active courses
    db.course.count({ where: { isPublished: true, isDeleted: 0, status: 1 } }),

    // Total revenue dari invoice yang sudah dibayar
    db.invoice.aggregate({
      where: { invoiceStatus: "paid", isDeleted: 0, status: 1 },
      _sum: { totalAmount: true },
    }),

    // Top 5 courses by enrollment count
    db.course.findMany({
      where: { isDeleted: 0, status: 1 },
      select: {
        id: true,
        title: true,
        price: true,
        rating: true,
        reviewCount: true,
        thumbnail: true,
        category: { select: { name: true } },
        instructor: { select: { name: true } },
        _count: { select: { enrollments: { where: { isDeleted: 0 } } } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const totalRevenue = Number(revenueAggregate._sum.totalAmount ?? 0);

  // ─── Monthly Revenue (6 bulan terakhir) ────────────────────────────────────
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const paidInvoices = await db.invoice.findMany({
    where: {
      invoiceStatus: "paid",
      isDeleted: 0,
      createdDate: { gte: sixMonthsAgo },
    },
    select: { totalAmount: true, createdDate: true },
  });

  // Group by bulan
  const monthlyMap: Record<string, number> = {};
  paidInvoices.forEach((inv) => {
    const key = inv.createdDate.toISOString().slice(0, 7); // "YYYY-MM"
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(inv.totalAmount);
  });

  // Generate 6 bulan terakhir (isi 0 jika tidak ada transaksi)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    return { month: label, revenue: monthlyMap[key] ?? 0 };
  });

  // ─── Top courses with revenue calculation ─────────────────────────────────
  const topCoursesFormatted = topCourses.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.category.name,
    instructor: c.instructor.name,
    enrollments: c._count.enrollments,
    revenue: c._count.enrollments * Number(c.price),
    rating: c.rating,
    reviewCount: c.reviewCount,
  }));

  return NextResponse.json({
    stats: {
      totalStudents,
      totalInstructors,
      totalActiveCourses,
      totalRevenue,
    },
    monthlyRevenue,
    topCourses: topCoursesFormatted,
  });
}
