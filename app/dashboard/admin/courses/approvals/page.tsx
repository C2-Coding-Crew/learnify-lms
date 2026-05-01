import { db } from "@/lib/db";
import { ApprovalButtons } from "@/components/dashboard/admin/approval-buttons";
import { ShieldCheck, Search, Filter } from "lucide-react";

export default async function CourseApprovalsPage() {
  const pendingCourses = await db.course.findMany({
    where: { 
      isPublished: false, 
      isDeleted: 0, 
      status: 1 
    },
    include: {
      instructor: { select: { name: true, email: true } },
      category: { select: { name: true } }
    },
    orderBy: { createdDate: 'desc' }
  });

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">Course Approvals 🛡️</h1>
          <p className="text-slate-400 text-sm font-bold mt-1">Review and approve new courses submitted by instructors.</p>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-[#2D2D2D] text-lg">Pending Reviews</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search courses..." className="pl-11 pr-4 h-11 bg-orange-50/40 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-orange-200 w-56 font-medium transition-all" />
            </div>
            <button className="h-11 px-4 bg-orange-50 text-orange-600 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-orange-100 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>
        
        {pendingCourses.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h4 className="text-lg font-black text-slate-700">All Caught Up!</h4>
            <p className="text-sm text-slate-400 mt-2">There are no pending courses waiting for approval right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Course Details", "Instructor", "Category", "Price", "Actions"].map((h, i) => (
                    <th key={i} className={`pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingCourses.map((course) => (
                  <tr key={course.id} className="border-b border-slate-50 last:border-none hover:bg-orange-50/30 transition-colors group">
                    <td className="py-4">
                      <p className="font-bold text-sm text-[#2D2D2D] line-clamp-1">{course.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">Submitted on {course.createdDate.toLocaleDateString()}</p>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-bold text-slate-600">{course.instructor.name}</p>
                      <p className="text-[11px] text-slate-400">{course.instructor.email}</p>
                    </td>
                    <td className="py-4 text-sm font-bold text-orange-600">
                      <span className="bg-orange-50 px-3 py-1 rounded-lg">{course.category.name}</span>
                    </td>
                    <td className="py-4 text-sm font-black text-green-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(course.price))}
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end">
                        <ApprovalButtons courseId={course.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
