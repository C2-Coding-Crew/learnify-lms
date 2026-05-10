import { FileText, CheckCircle, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

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

  // Fetch assignments for those courses
  const assignmentsData = await db.assignment.findMany({
    where: { courseId: { in: courseIds }, isDeleted: 0 },
    include: {
      course: { select: { title: true } },
      submissions: {
        where: { userId, isDeleted: 0 },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const assignments = assignmentsData.map((a) => {
    const submission = a.submissions[0];
    return {
      id: a.id,
      title: a.title,
      course: a.course.title,
      dueDate: a.dueDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: submission ? (submission.grade ? "graded" : "submitted") : "pending",
      grade: submission?.grade || null,
    };
  });

  const stats = {
    pending: assignments.filter((a) => a.status === "pending").length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
    graded: assignments.filter((a) => a.status === "graded").length,
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">Assignments 📝</h1>
          <p className="text-slate-400 text-sm mt-1">Track your tasks and submissions.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Pending", value: stats.pending.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Submitted", value: stats.submitted.toString(), icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Graded", value: stats.graded.toString(), icon: FileText, color: "text-green-600", bg: "bg-green-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-8">
          <h3 className="font-black text-slate-800 text-lg mb-6">All Assignments</h3>
          <div className="grid gap-4">
            {assignments.length === 0 ? (
              <div className="p-10 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                Belum ada tugas untuk kursus yang Anda ambil.
              </div>
            ) : (
              assignments.map((a) => (
                <div key={a.id} className="p-5 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.status === 'pending' ? 'bg-orange-50 text-orange-500' : a.status === 'submitted' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{a.title}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{a.course} · Due {a.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {a.grade && <span className="text-sm font-black text-green-600">{a.grade}</span>}
                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg ${a.status === 'pending' ? 'bg-orange-50 text-orange-500' : a.status === 'submitted' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600'}`}>
                      {a.status}
                    </span>
                    {a.status === 'pending' && (
                      <button className="h-9 px-5 bg-[#FF6B4A] text-white rounded-xl font-bold text-xs hover:bg-[#fa5a36] transition-colors shadow-md shadow-orange-100">
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
    </main>
  );
}
