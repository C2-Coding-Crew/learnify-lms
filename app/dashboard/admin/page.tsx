import AdminDashboard from "@/components/dashboard/admin/admin";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/login");

  // Fetch Platform Stats
  const [studentCount, instructorCount, courseCount, enrollments] = await Promise.all([
    db.user.count({ where: { roleId: 3, isDeleted: 0 } }),
    db.user.count({ where: { roleId: 2, isDeleted: 0 } }),
    db.course.count({ where: { isPublished: true, isDeleted: 0 } }),
    db.enrollment.findMany({
      where: { isDeleted: 0 },
      include: { course: { select: { price: true } } }
    })
  ]);

  const totalRevenue = enrollments.reduce((sum: number, enr: any) => sum + Number(enr.course.price || 0), 0);

  return (
    <AdminDashboard
      userName={session.user.name}
      userEmail={session.user.email}
      userRole="Admin"
      twoFactorEnabled={session.user.twoFactorEnabled ?? false}
      stats={{
        studentCount,
        instructorCount,
        courseCount,
        totalRevenue
      }}
    />
  );
}