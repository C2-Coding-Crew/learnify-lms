import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApprovalButtons } from "@/components/dashboard/admin/approval-buttons";
import {
  ShieldCheck,
  Clock,
  BookOpen,
  Tag,
  AlertCircle,
} from "lucide-react";

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getPendingCourses() {
  return db.course.findMany({
    where: { status: 2, isDeleted: 0 },
    include: {
      instructor: { select: { name: true, email: true } },
      category: { select: { name: true } },
      lessons: {
        where: { isDeleted: 0 },
        select: { id: true, isFree: true },
      },
    },
    orderBy: { createdDate: "desc" },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const LEVEL_COLOR: Record<string, string> = {
  beginner: "bg-green-50 text-green-700",
  intermediate: "bg-yellow-50 text-yellow-700",
  advanced: "bg-red-50 text-red-700",
};

// ── Page Component ────────────────────────────────────────────────────────────
export default async function CourseApprovalsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const pendingCourses = await getPendingCourses();
  const pendingCount = pendingCourses.length;

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight flex items-center gap-3">
            Course Approvals 🛡️
            {pendingCount > 0 && (
              <span className="text-sm font-black bg-orange-500 text-white px-3 py-1 rounded-full shadow-lg shadow-orange-200">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1">
            Review dan terbitkan kursus yang diajukan oleh instruktur.
          </p>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-sm font-black text-slate-600">
            {pendingCount === 0
              ? "Semua bersih!"
              : `${pendingCount} menunggu approval`}
          </span>
        </div>
      </header>

      {/* ── Table List ── */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-5 w-[180px] sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_0_#f1f5f9]">Aksi</th>
                <th className="px-6 py-5">Info Kursus</th>
                <th className="px-6 py-5">Kategori & Level</th>
                <th className="px-6 py-5">Instruktur</th>
                <th className="px-6 py-5">Harga</th>
                <th className="px-6 py-5">Materi</th>
                <th className="px-6 py-5 pr-10">Tgl Pengajuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pendingCount === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center">
                        <ShieldCheck size={32} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-700">All Caught Up! 🎉</h4>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Semua kursus sudah diproses.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingCourses.map((course) => {
                  const totalLessons = course.lessons.length;
                  const isFree = Number(course.price) === 0;
                  const levelColor = LEVEL_COLOR[course.level?.toLowerCase()] ?? "bg-slate-50 text-slate-500";

                  return (
                    <tr key={course.id} className="group hover:bg-slate-50/50 transition-colors">
                      {/* Actions */}
                      <td className="px-6 py-5 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-[1px_0_0_0_#f1f5f9] transition-colors">
                        <ApprovalButtons
                          courseId={course.id}
                          courseTitle={course.title}
                        />
                      </td>

                      {/* Course Info */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                            {course.thumbnail ? (
                              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <BookOpen size={16} />
                              </div>
                            )}
                          </div>
                          <div className="max-w-[300px]">
                            <p className="font-black text-slate-800 truncate mb-0.5">{course.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate">ID: {course.id} • {course.slug || "No-Slug"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Level */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-wider w-fit">
                            <Tag size={10} />
                            {course.category.name}
                          </span>
                          <span className={`inline-flex text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider w-fit ${levelColor}`}>
                            {course.level}
                          </span>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">{course.instructor.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{course.instructor.email}</span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-5">
                        <span className={`text-sm font-black ${isFree ? "text-green-600" : "text-orange-600"}`}>
                          {isFree ? "GRATIS" : fmtIDR(Number(course.price))}
                        </span>
                      </td>

                      {/* Lessons */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className={`text-xs font-black ${totalLessons === 0 ? "text-red-500" : "text-slate-700"}`}>
                            {totalLessons} Lessons
                          </span>
                          {totalLessons === 0 && (
                            <span className="text-[9px] text-red-400 font-bold flex items-center gap-1">
                              <AlertCircle size={10} /> No Content
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 pr-10">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={14} className="text-slate-300" />
                          <span className="text-xs font-bold">
                            {(course.createdDate as Date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
