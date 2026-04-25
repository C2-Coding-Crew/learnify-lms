import { Search, MoreVertical, GraduationCap, Users, BookOpen, Filter } from "lucide-react";

export default async function AdminStudentsPage() {
  const students = [
    { id: 1, name: "Budi Santoso",   email: "budi@example.com",  enrolled: 3, completed: 1, joined: "12 Jan 2024", status: "active" },
    { id: 2, name: "Siti Aminah",    email: "siti@example.com",  enrolled: 5, completed: 3, joined: "05 Feb 2024", status: "active" },
    { id: 3, name: "Andi Wijaya",    email: "andi@example.com",  enrolled: 2, completed: 2, joined: "20 Mar 2024", status: "active" },
    { id: 4, name: "Rina Kusuma",    email: "rina@example.com",  enrolled: 1, completed: 0, joined: "01 Apr 2024", status: "inactive" },
    { id: 5, name: "Dimas Pratama",  email: "dimas@example.com", enrolled: 4, completed: 2, joined: "15 Apr 2024", status: "active" },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">Manage Students 🎓</h1>
            <p className="text-slate-400 text-sm font-bold mt-1">Monitor and manage all registered students.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Students",   value: "12,540", icon: GraduationCap, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Active This Month", value: "8,234",  icon: Users,          color: "text-green-600",  bg: "bg-green-50" },
            { label: "Avg. Courses",      value: "3.2",    icon: BookOpen,        color: "text-blue-600",   bg: "bg-blue-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-orange-50 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}><s.icon size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h4 className="text-2xl font-black text-[#2D2D2D]">{s.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="font-black text-[#2D2D2D] text-lg">Student List</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search students..." className="pl-11 pr-4 h-11 bg-orange-50/40 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-orange-200 w-56 font-medium transition-all" />
              </div>
              <button className="h-11 px-4 bg-orange-50 text-orange-600 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-orange-100 transition-colors">
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Student", "Enrolled", "Completed", "Joined", "Status", ""].map((h, i) => (
                    <th key={i} className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-none hover:bg-orange-50/30 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black text-sm">{s.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-sm text-[#2D2D2D]">{s.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-bold text-slate-600">{s.enrolled} courses</td>
                    <td className="py-4 text-sm font-bold text-green-600">{s.completed} courses</td>
                    <td className="py-4 text-xs font-bold text-slate-400">{s.joined}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg ${s.status === "active" ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>{s.status}</span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50"><MoreVertical size={16} /></button>
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
