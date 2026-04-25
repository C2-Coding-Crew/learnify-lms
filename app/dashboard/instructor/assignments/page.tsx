import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
  if (roleId !== 3) {
    redirect("/dashboard");
  }

  const mockAssignments = [
    { id: 1, student: "Aditya Pratama", task: "UI Case Study", course: "UI/UX Fundamentals", status: "pending", submitted: "2 hours ago" },
    { id: 2, student: "Siti Aminah", task: "Figma Component Lab", course: "Figma Pro", status: "pending", submitted: "Yesterday" },
    { id: 3, student: "Rina Kusuma", task: "Wireframing Basics", course: "UI/UX Fundamentals", status: "graded", submitted: "3 days ago", grade: "92/100" },
  ];

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
          { label: "Pending Grading", value: "12", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Graded This Week", value: "48", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Needs Attention", value: "3", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
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
        <div className="grid gap-4">
          {mockAssignments.map((assignment) => (
            <div key={assignment.id} className="p-5 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-lg hover:shadow-slate-100 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${assignment.status === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{assignment.task}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-600">{assignment.student}</span>
                    <span className="text-[10px] text-slate-400">• {assignment.course}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  {assignment.status === 'pending' ? (
                    <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">Pending</span>
                  ) : (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">{assignment.grade}</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
                  <p className="text-xs font-bold text-slate-600">{assignment.submitted}</p>
                </div>
                <button className={`h-10 px-6 rounded-xl font-bold text-xs transition-all ${assignment.status === 'pending' ? 'bg-[#FF6B4A] text-white hover:bg-[#fa5a36] shadow-md shadow-orange-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {assignment.status === 'pending' ? 'Grade Now' : 'Review'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
