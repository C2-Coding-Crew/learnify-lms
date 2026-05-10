import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.roleId !== 2) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const instructorId = session.user.id;

    // 1. Ambil data kursus instruktur ini
    const courses = await db.course.findMany({
      where: { instructorId, isDeleted: 0 },
      select: { id: true, title: true, _count: { select: { enrollments: true } } },
    });

    const courseIds = courses.map(c => c.id);

    // 2. Ambil data invoice (revenue) untuk kursus instruktur ini
    const invoices = await db.invoice.findMany({
      where: { 
        courseId: { in: courseIds }, 
        invoiceStatus: "paid", 
        isDeleted: 0 
      },
      select: { totalAmount: true, createdDate: true },
    });

    // 3. Ambil data enrollment untuk kursus instruktur ini
    const enrollments = await db.enrollment.findMany({
      where: { courseId: { in: courseIds }, isDeleted: 0 },
      select: { enrolledAt: true },
    });

    // Format data per bulan untuk 6 bulan terakhir
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const revenueByMonth: Record<string, number> = {};
    const enrollmentsByMonth: Record<string, number> = {};

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Inisialisasi 6 bulan terakhir
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      revenueByMonth[key] = 0;
      enrollmentsByMonth[key] = 0;
    }

    invoices.forEach(inv => {
      if (inv.createdDate >= sixMonthsAgo) {
        const key = `${monthNames[inv.createdDate.getMonth()]} ${inv.createdDate.getFullYear()}`;
        if (revenueByMonth[key] !== undefined) {
          revenueByMonth[key] += Number(inv.totalAmount);
        }
      }
    });

    enrollments.forEach(en => {
      if (en.enrolledAt >= sixMonthsAgo) {
        const key = `${monthNames[en.enrolledAt.getMonth()]} ${en.enrolledAt.getFullYear()}`;
        if (enrollmentsByMonth[key] !== undefined) {
          enrollmentsByMonth[key] += 1;
        }
      }
    });

    const revenueData = Object.keys(revenueByMonth).map(key => ({
      name: key,
      revenue: revenueByMonth[key],
    }));

    const enrollmentsData = Object.keys(enrollmentsByMonth).map(key => ({
      name: key,
      enrollments: enrollmentsByMonth[key],
    }));

    const coursePopularity = courses.map(c => ({
      name: c.title.length > 20 ? c.title.substring(0, 20) + "..." : c.title,
      students: c._count.enrollments,
    })).sort((a, b) => b.students - a.students).slice(0, 5); // Top 5 courses

    return NextResponse.json({
      revenueData,
      enrollmentsData,
      coursePopularity,
      totalRevenue: revenueData.reduce((acc, curr) => acc + curr.revenue, 0),
      totalEnrollments: enrollments.length,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
