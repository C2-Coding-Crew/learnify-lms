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

  // Fetch Upcoming Schedule (Next 24 hours)
  const upcomingLessons = await db.schedule.findMany({
    where: {
      course: {
        enrollments: { some: { userId: session.user.id } }
      },
      startTime: { gte: new Date() },
      isDeleted: 0
    },
    take: 1,
    orderBy: { startTime: "asc" }
  });

  const nextLesson = upcomingLessons[0] ? {
    title: upcomingLessons[0].title,
    time: upcomingLessons[0].startTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    date: upcomingLessons[0].startTime.toLocaleDateString("id-ID", { weekday: "long" })
  } : null;

  const progress = await db.lessonProgress.findMany({
    where: { userId: session.user.id, isCompleted: true, isDeleted: 0 }
  });

  const totalLessonsInAllCourses = enrollments.reduce((sum, enr) => sum + enr.course.lessons.length, 0);
  const totalCompleted = progress.length;
  
  // Real performance calculation (0.000 to 10.000 scale)
  const performanceGrade = totalLessonsInAllCourses > 0 
    ? ((totalCompleted / totalLessonsInAllCourses) * 10).toFixed(3) 
    : "0.000";

  const todos = await db.todo.findMany({
    where: { userId: session.user.id, isDeleted: 0 },
    orderBy: { createdDate: "desc" }
  });

  const formattedTodos = todos.map((t: any) => ({
    id: t.id,
    task: t.task,
    date: t.createdDate.toLocaleDateString("id-ID", { day: "numeric", month: "long" }),
    done: t.isCompleted
  }));

  const formattedCourses = enrollments.map((enr: any) => {
    const courseLessons = enr.course.lessons;
    const completedInThisCourse = progress.filter((p: any) => courseLessons.some((l: any) => l.id === p.lessonId)).length;
    const totalInThisCourse = courseLessons.length;
    const progressPercent = totalInThisCourse > 0 ? Math.round((completedInThisCourse / totalInThisCourse) * 100) : 0;
    
    const h = Math.floor(enr.course.totalMinutes / 60);
    const m = enr.course.totalMinutes % 60;
    const timeStr = h > 0 ? `${h}hrs ${m > 0 ? `${m}m` : ""}`.trim() : `${m}m`;

    return {
      id: enr.course.id,
      slug: enr.course.slug,
      title: enr.course.title,
      time: timeStr,
      lessons: `${completedInThisCourse}/${totalInThisCourse} Lessons`,
      progress: progressPercent,
      active: true,
    };
  });

  const now = new Date();
  const currentMonth = now.toLocaleString("default", { month: "long" });
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();

  return (
    <StudentDashboard
      userName={session.user.name}
      userEmail={session.user.email}
      userRole="Student"
      twoFactorEnabled={session.user.twoFactorEnabled ?? false}
      enrolledCourses={formattedCourses}
      todos={formattedTodos}
      performanceGrade={performanceGrade}
      nextLesson={nextLesson}
      calendar={{
        month: currentMonth,
        year: currentYear,
        today: currentDay,
        daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      }}
    />
  );
}