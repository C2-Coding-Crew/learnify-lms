import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApprovalButtons } from "@/components/dashboard/admin/approval-buttons";
import {
  ShieldCheck,
  Clock,
  BookOpen,
  DollarSign,
  User,
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
            Course Approvals
            {pendingCount > 0 && (
              <span className="text-sm font-black bg-orange-500 text-white px-3 py-1 rounded-full shadow-lg shadow-orange-200">
                {pendingCount} pending
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1">
            Review dan terbitkan kursus yang diajukan oleh instruktur.
          </p>
        </div>

        {/* Summary bar */}
        <div className="flex items-center gap-3 bg-white border border-orange-50 rounded-2xl px-5 py-3 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-sm font-black text-slate-600">
            {pendingCount === 0
              ? "Tidak ada kursus pending"
              : `${pendingCount} kursus menunggu persetujuan`}
          </span>
        </div>
      </header>

      {/* ── Empty State ── */}
      {pendingCount === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-16 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-700">All Caught Up! 🎉</h4>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Semua kursus sudah diproses. Tidak ada yang menunggu persetujuan.
            </p>
          </div>
        </div>
      ) : (
        /* ── Course Cards ── */
        <div className="space-y-6">
          {pendingCourses.map((course) => {
            const totalLessons = course.lessons.length;
            const freeLessons = course.lessons.filter((l) => l.isFree).length;
            const isFree = Number(course.price) === 0;
            const levelColor =
              LEVEL_COLOR[course.level?.toLowerCase()] ?? "bg-slate-50 text-slate-500";

            return (
              <div
                key={course.id}
                className="bg-white rounded-[2rem] border border-orange-50 shadow-sm hover:shadow-lg hover:shadow-orange-50 transition-all duration-300 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail */}
                  <div className="lg:w-64 h-48 lg:h-auto bg-gradient-to-br from-orange-100 to-orange-50 flex-shrink-0 flex items-center justify-center relative">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-orange-300">
                        <BookOpen size={40} />
                        <span className="text-xs font-bold">No Thumbnail</span>
                      </div>
                    )}
                    {/* Pending badge */}
                    <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      Pending Review
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        {/* Category & Level */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="flex items-center gap-1 text-[10px] font-black bg-orange-50 text-orange-600 px-3 py-1 rounded-full uppercase tracking-wider">
                            <Tag size={10} />
                            {course.category.name}
                          </span>
                          <span
                            className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${levelColor}`}
                          >
                            {course.level}
                          </span>
                          {isFree && (
                            <span className="text-[10px] font-black bg-green-50 text-green-600 px-3 py-1 rounded-full uppercase tracking-wider">
                              Free
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-[#2D2D2D] leading-tight mb-1">
                          {course.title}
                        </h3>
                        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                          {course.description || "Tidak ada deskripsi."}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="shrink-0 text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Harga
                        </p>
                        <p className="text-xl font-black text-orange-600">
                          {isFree ? "Gratis" : fmtIDR(Number(course.price))}
                        </p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                        <User size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Instructor
                          </p>
                          <p className="text-xs font-black text-slate-700 truncate max-w-[100px]">
                            {course.instructor.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                        <BookOpen size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Lessons
                          </p>
                          <p className="text-xs font-black text-slate-700">
                            {totalLessons} total · {freeLessons} free
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Durasi
                          </p>
                          <p className="text-xs font-black text-slate-700">
                            {course.totalMinutes > 0
                              ? `${Math.floor(course.totalMinutes / 60)}j ${course.totalMinutes % 60}m`
                              : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                        <DollarSign size={14} className="text-slate-400 shrink-0" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Submitted
                          </p>
                          <p className="text-xs font-black text-slate-700">
                            {(course.createdDate as Date).toLocaleDateString(
                              "id-ID",
                              { day: "2-digit", month: "short", year: "numeric" }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Warning if no lessons */}
                    {totalLessons === 0 && (
                      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 mb-4">
                        <AlertCircle size={16} className="text-yellow-600 shrink-0" />
                        <p className="text-xs font-bold text-yellow-700">
                          Kursus ini belum memiliki lesson. Pertimbangkan untuk
                          menolak sampai konten ditambahkan.
                        </p>
                      </div>
                    )}

                    {/* Instructor email */}
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Diajukan oleh:
                      </span>
                      <span className="text-[11px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                        {course.instructor.email}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end pt-4 border-t border-slate-50">
                      <ApprovalButtons
                        courseId={course.id}
                        courseTitle={course.title}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
