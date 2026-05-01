import { FileText, CheckCircle, Clock } from "lucide-react";

export default async function StudentAssignmentsPage() {
  const assignments = [
    { id: 1, title: "UI Case Study: Redesign Tokopedia", course: "UI/UX Fundamentals", dueDate: "30 Jun 2024", status: "pending" },
    { id: 2, title: "Wireframing Prototype", course: "Figma Pro", dueDate: "24 Jun 2024", status: "submitted", grade: "88/100" },
    { id: 3, title: "Introduction to Layouts", course: "UI/UX Fundamentals", dueDate: "10 Jun 2024", status: "graded", grade: "95/100" },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">Assignments 📝</h1>
          <p className="text-slate-400 text-sm mt-1">Track your tasks and submissions.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Pending", value: "3", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Submitted", value: "8", icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Graded", value: "12", icon: FileText, color: "text-green-600", bg: "bg-green-50" },
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
            {assignments.map((a) => (
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
            ))}
          </div>
        </div>
    </main>
  );
}
