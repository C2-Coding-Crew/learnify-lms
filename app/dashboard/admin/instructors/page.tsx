import { Search, MoreVertical, UserCheck, BookOpen, Star, Filter } from "lucide-react";

export default async function AdminInstructorsPage() {
  const instructors = [
    { id: 1, name: "Dr. Ahmad Fauzi",  email: "ahmad@learnify.id",  courses: 8, students: 1240, rating: 4.9, joined: "10 Jan 2024", status: "active" },
    { id: 2, name: "Sarah Putri",       email: "sarah@learnify.id",  courses: 5, students: 856,  rating: 4.7, joined: "20 Feb 2024", status: "active" },
    { id: 3, name: "Ricky Hartono",     email: "ricky@learnify.id",  courses: 3, students: 423,  rating: 4.5, joined: "05 Mar 2024", status: "pending" },
    { id: 4, name: "Dewi Lestari",      email: "dewi@learnify.id",   courses: 6, students: 975,  rating: 4.8, joined: "15 Mar 2024", status: "active" },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">Manage Instructors 👨‍🏫</h1>
            <p className="text-slate-400 text-sm font-bold mt-1">Review and manage instructor accounts and courses.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Instructors", value: "842",  icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Active Courses",    value: "3,201", icon: BookOpen,   color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Avg. Rating",       value: "4.76",  icon: Star,       color: "text-yellow-500", bg: "bg-yellow-50" },
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
            <h3 className="font-black text-[#2D2D2D] text-lg">Instructor List</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search instructors..." className="pl-11 pr-4 h-11 bg-orange-50/40 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-orange-200 w-56 font-medium transition-all" />
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
                  {["Instructor", "Courses", "Students", "Rating", "Joined", "Status", ""].map((h, i) => (
                    <th key={i} className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {instructors.map((ins) => (
                  <tr key={ins.id} className="border-b border-slate-50 last:border-none hover:bg-orange-50/30 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black text-sm">{ins.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-sm text-[#2D2D2D]">{ins.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{ins.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-bold text-slate-600">{ins.courses}</td>
                    <td className="py-4 text-sm font-bold text-slate-600">{ins.students.toLocaleString("id-ID")}</td>
                    <td className="py-4">
                      <span className="text-sm font-black text-yellow-500 flex items-center gap-1">⭐ {ins.rating}</span>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-400">{ins.joined}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg ${ins.status === "active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{ins.status}</span>
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
