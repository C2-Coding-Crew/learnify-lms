import { FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AssignmentsList from "@/components/dashboard/student/assignments-list";

export default async function StudentAssignmentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  // Fetch enrolled courses
  const enrollments = await db.enrollment.findMany({
    where: { userId, isDeleted: 0 },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // Fetch assignments for enrolled courses with student's own submissions
  const assignmentsData = await db.assignment.findMany({
    where: { courseId: { in: courseIds }, isDeleted: 0 },
    include: {
      course: { select: { title: true, slug: true } },
      submissions: {
        where: { userId },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const assignments = assignmentsData.map((a) => {
    const submission = a.submissions[0] ?? null;
    return {
      id: a.id,
      title: a.title,
      description: a.description ?? null,
      course: a.course.title,
      courseSlug: a.course.slug,
      dueDate: a.dueDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: (submission
        ? submission.grade
          ? "graded"
          : "submitted"
        : "pending") as "pending" | "submitted" | "graded",
      grade: submission?.grade ?? null,
      feedback: submission?.feedback ?? null,
      submittedContent: submission?.content ?? null,
      submittedFileUrl: submission?.filePath ?? null,
    };
  });

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Assignments 📝</h1>
        <p className="text-slate-400 text-sm mt-1">Track, submit, and review your tasks.</p>
      </header>

      <AssignmentsList initialAssignments={assignments} />
    </main>
  );
}
