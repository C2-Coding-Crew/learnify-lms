import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import { Search, Filter, MoreVertical, GraduationCap, ArrowUpRight } from "lucide-react";

export default async function InstructorStudentsPage() {
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

  const mockStudents = [
    { id: 1, name: "Budi Santoso", email: "budi@example.com", enrolledDate: "12 Oct 2024", progress: 85, course: "UI/UX Fundamentals" },
    { id: 2, name: "Siti Aminah", email: "siti@example.com", enrolledDate: "10 Oct 2024", progress: 45, course: "React Masterclass" },
    { id: 3, name: "Andi Wijaya", email: "andi@example.com", enrolledDate: "05 Oct 2024", progress: 100, course: "Figma Pro" },
    { id: 4, name: "Rina Kusuma", email: "rina@example.com", enrolledDate: "01 Oct 2024", progress: 10, course: "UI/UX Fundamentals" },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="My Students 🎓" 
        subtitle="Manage and monitor your students' progress."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: "Total Students", value: "1,248", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active This Week", value: "856", icon: ArrowUpRight, color: "text-green-600", bg: "bg-green-50" },
          { label: "Completion Rate", value: "68%", icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-50" },
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-slate-800 text-lg">Student Roster</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search students..." 
                className="pl-11 pr-4 h-11 bg-slate-50 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all w-64 font-medium"
              />
            </div>
            <button className="h-11 px-4 bg-slate-50 text-slate-600 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-slate-100 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Student Name</th>
                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Enrolled Course</th>
                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Progress</th>
                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Enrolled Date</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.map((student) => (
                <tr key={student.id} className="border-b border-slate-50 last:border-none group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 text-[#FF6B4A] rounded-xl flex items-center justify-center font-black text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{student.name}</p>
                        <p className="text-[11px] font-medium text-slate-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-[12px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {student.course}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${student.progress === 100 ? 'bg-green-500' : 'bg-[#FF6B4A]'}`} 
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-600">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-xs font-bold text-slate-500">{student.enrolledDate}</span>
                  </td>
                  <td className="py-4 text-right">
                    <button className="p-2 text-slate-300 hover:text-[#FF6B4A] transition-colors rounded-lg hover:bg-orange-50">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
