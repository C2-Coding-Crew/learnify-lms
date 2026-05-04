import { Download, FileText, Link2, BookOpen, Search } from "lucide-react";

export default async function StudentResourcesPage() {
  const resources = [
    { id: 1, title: "UI/UX Design Cheat Sheet", course: "UI/UX Fundamentals", type: "PDF", size: "2.4 MB", date: "21 Jun 2024" },
    { id: 2, title: "Figma Component Kit", course: "Figma Pro", type: "Figma", size: "8.1 MB", date: "18 Jun 2024" },
    { id: 3, title: "React Hooks Reference Guide", course: "React Masterclass", type: "PDF", size: "1.2 MB", date: "15 Jun 2024" },
    { id: 4, title: "Color Theory Handbook", course: "UI/UX Fundamentals", type: "PDF", size: "3.6 MB", date: "10 Jun 2024" },
    { id: 5, title: "JavaScript ES2024 Notes", course: "React Masterclass", type: "Docs", size: "512 KB", date: "05 Jun 2024" },
  ];

  const typeIcon = (type: string) => {
    if (type === "PDF") return <FileText size={18} />;
    if (type === "Figma") return <Link2 size={18} />;
    return <BookOpen size={18} />;
  };

  const typeColor = (type: string) => {
    if (type === "PDF") return "bg-red-50 text-red-500";
    if (type === "Figma") return "bg-purple-50 text-purple-500";
    return "bg-blue-50 text-blue-500";
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Resources 📦</h1>
            <p className="text-slate-400 text-sm mt-1">Download course materials and references.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search resources..."
              className="pl-11 pr-4 h-11 bg-white rounded-xl border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all w-64 font-medium shadow-sm"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Files", value: `${resources.length}`, icon: Download },
            { label: "Courses",     value: "3",                   icon: BookOpen },
            { label: "Total Size",  value: "15.8 MB",             icon: FileText },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B4A] flex items-center justify-center">
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h4 className="text-2xl font-black text-slate-800">{s.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-8">
          <h3 className="font-black text-slate-800 text-lg mb-6">All Resources</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">File Name</th>
                  <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Course</th>
                  <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Type</th>
                  <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Size</th>
                  <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Added</th>
                  <th className="pb-4"></th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeColor(r.type)}`}>
                          {typeIcon(r.type)}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{r.title}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">{r.course}</span>
                    </td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md ${typeColor(r.type)}`}>{r.type}</span>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-500">{r.size}</td>
                    <td className="py-4 text-xs font-bold text-slate-400">{r.date}</td>
                    <td className="py-4 text-right">
                      <button className="h-9 px-4 bg-[#FF6B4A] text-white rounded-xl font-bold text-xs hover:bg-[#fa5a36] transition-colors shadow-md shadow-orange-100 flex items-center gap-1.5 ml-auto opacity-0 group-hover:opacity-100">
                        <Download size={14} /> Download
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
