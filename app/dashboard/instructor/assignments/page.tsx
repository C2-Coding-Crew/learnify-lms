import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import InstructorHeader from "@/components/dashboard/instructor/header";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default async function InstructorAssignmentsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const roleId = (session.user as any).roleId;
  if (Number(roleId) !== 2) {
    redirect("/dashboard");
  }

  const instructorId = session.user.id;

  // 1. Fetch real submissions
  const submissions = await (db as any).submission.findMany({
    where: {
      assignment: { course: { instructorId, isDeleted: 0 } },
      isDeleted: 0,
      status_code: 1,
    },
    include: {
      user: { select: { name: true, image: true } },
      assignment: {
        include: {
          course: { select: { title: true } },
        },
      },
    },
    orderBy: { createdDate: "desc" },
    take: 20,
  });

  // 2. Stats
  const pendingCount = submissions.filter((s: any) => s.grade === null).length;
  const gradedCount = submissions.filter((s: any) => s.grade !== null).length;
  const needsAttention = submissions.filter((s: any) => s.grade !== null && parseFloat(s.grade.toString()) < 60).length;

  // 3. Relative time helper
  const getRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="Assignments 📝" 
        subtitle="Review and grade student submissions."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Pending Grading", value: pendingCount.toString(), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Recently Graded", value: gradedCount.toString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Needs Attention", value: needsAttention.toString(), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
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
        <h3 className="font-black text-slate-800 text-lg mb-6">Recent Submissions</h3>
        
        {submissions.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} />
            </div>
            <p className="text-slate-400 font-bold">No submissions yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {submissions.map((s: any) => (
              <div key={s.id} className="p-5 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-lg hover:shadow-slate-100 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.grade === null ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{s.assignment.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-slate-600">{s.user.name}</span>
                      <span className="text-[10px] text-slate-400">• {s.assignment.course.title}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    {s.grade === null ? (
                      <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">Pending</span>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{s.grade}/100</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
                    <p className="text-xs font-bold text-slate-600">{getRelativeTime(s.createdDate)}</p>
                  </div>
                  <Link href={`/dashboard/instructor/assignments/${s.id}`}>
                    <button className={`h-10 px-6 rounded-xl font-bold text-xs transition-all ${s.grade === null ? 'bg-[#FF6B4A] text-white hover:bg-[#fa5a36] shadow-md shadow-orange-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      {s.grade === null ? 'Grade Now' : 'Review'}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
