import StudentDashboard from "@/components/dashboard/student/dashboard";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/login");

  // Fetch Enrollments and Progress
  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id, isDeleted: 0 },
    include: {
      course: {
        include: {
          lessons: {
            where: { isDeleted: 0, status: 1 }
          }
        }
      }
    },
    orderBy: { enrolledAt: "desc" }
  });

  const progress = await db.lessonProgress.findMany({
    where: { userId: session.user.id, isDeleted: 0 }
  });

  const formattedCourses = enrollments.map((enr: any) => {
    const totalLessons = enr.course.lessons.length;
    const completedLessons = progress.filter((p: any) => p.isCompleted && enr.course.lessons.some((l: any) => l.id === p.lessonId)).length;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    // Format duration
    const h = Math.floor(enr.course.totalMinutes / 60);
    const m = enr.course.totalMinutes % 60;
    const timeStr = h > 0 ? `${h}hrs ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;

    return {
      id: enr.course.id,
      slug: enr.course.slug,
      title: enr.course.title,
      time: timeStr,
      lessons: `${completedLessons}/${totalLessons} Lessons`,
      progress: progressPercent,
      active: true,
    };
  });

  return (
    <StudentDashboard
      userName={session.user.name}
      userEmail={session.user.email}
      userRole="Student"
      twoFactorEnabled={session.user.twoFactorEnabled ?? false}
      enrolledCourses={formattedCourses}
    />
  );
}