import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import InstructorDashboardContent from "@/components/dashboard/instructor/instructor";
import { db } from "@/lib/db";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/login");

  // Fetch Courses
  const instructorCourses = await db.course.findMany({
    where: { instructorId: session.user.id, isDeleted: 0 },
    include: {
      _count: {
        select: { enrollments: { where: { isDeleted: 0 } } }
      }
    },
    orderBy: { createdDate: "desc" }
  });

  // Fetch Pending Submissions
  const pendingSubmissions = await db.submission.findMany({
    where: {
      assignment: {
        course: { instructorId: session.user.id }
      },
      grade: null,
      isDeleted: 0
    },
    include: {
      user: { select: { name: true } },
      assignment: { select: { title: true } }
    },
    take: 5,
    orderBy: { createdDate: "desc" }
  });

  let totalRevenue = 0;

  const formattedCourses = instructorCourses.map((course: any) => {
    const revenue = Number(course.price) * course._count.enrollments;
    totalRevenue += revenue;
    
    return {
      id: course.id,
      title: course.title,
      students: course._count.enrollments,
      rating: 4.8, // Placeholder for now
      revenue: new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(revenue),
      active: course.isPublished,
    };
  });

  const formattedGradings = pendingSubmissions.map((s: any) => ({
    id: s.id,
    studentName: s.user.name,
    assignment: s.assignment.title,
    dueDate: new Date(s.createdDate).toLocaleDateString("id-ID")
  }));

  return (
    <InstructorDashboardContent 
      userName={session.user.name} 
      userEmail={session.user.email} 
      userRole="Instructor" 
      courses={formattedCourses}
      totalRevenue={totalRevenue}
      twoFactorEnabled={session.user.twoFactorEnabled ?? false}
      initialGradings={formattedGradings}
    />
  );
}