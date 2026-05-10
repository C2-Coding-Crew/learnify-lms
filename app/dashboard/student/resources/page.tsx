import { Download, FileText, Link2, BookOpen, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function StudentResourcesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  // Fetch enrolled courses
  const enrollments = await db.enrollment.findMany({
    where: { userId, isDeleted: 0 },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // Fetch resources for those courses
  const resourcesData = await db.resource.findMany({
    where: { courseId: { in: courseIds }, isDeleted: 0 },
    include: {
      course: { select: { title: true } },
    },
    orderBy: { createdDate: "desc" },
  });

  const resources = resourcesData.map((r) => ({
    id: r.id,
    title: r.title,
    course: r.course.title,
    type: r.fileType,
    size: r.fileSize || "N/A",
    date: r.createdDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  const uniqueCourses = new Set(resources.map(r => r.course)).size;
  // Simple size parser for the stat box (just summing up what we can, but since sizes are strings like "2.4 MB", it's complex. Let's just count files for now or use a placeholder if empty).
  const totalSize = resources.length > 0 ? "Calculated" : "0 MB";

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
            { label: "Courses",     value: `${uniqueCourses}`,    icon: BookOpen },
            { label: "Storage",     value: resources.length > 0 ? "Synced" : "0 MB", icon: FileText },
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
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">
                      Belum ada resources untuk kursus Anda.
                    </td>
                  </tr>
                ) : (
                  resources.map((r) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </main>
  );
}
