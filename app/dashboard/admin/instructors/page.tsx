import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Search, MoreVertical, UserCheck, BookOpen, Star, Filter } from "lucide-react";

import InstructorCRUD from "@/components/dashboard/admin/users/instructor-crud";

// ── Types ─────────────────────────────────────────────────────────────────────
interface InstructorRow {
  id: string;
  name: string;
  email: string;
  courseCount: number;
  studentCount: number;
  avgRating: number;
  status: number;
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
}

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getInstructorData() {
  const [instructors, totalCount, activeCourseCount, ratingAggregate] =
    await Promise.all([
      // All instructors with course & enrollment data
      db.user.findMany({
        where: { roleId: 2, isDeleted: 0 },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          createdBy: true,
          createdDate: true,
          lastUpdatedBy: true,
          lastUpdatedDate: true,
          taughtCourses: {
            where: { isDeleted: 0 },
            select: {
              rating: true,
              _count: { select: { enrollments: { where: { isDeleted: 0 } } } },
            },
          },
        },
        orderBy: { createdDate: "desc" },
      }),

      // Total instructor count
      db.user.count({ where: { roleId: 2, isDeleted: 0 } }),

      // Total published courses across all instructors
      db.course.count({ where: { isPublished: true, isDeleted: 0 } }),

      // Platform-wide avg rating
      db.course.aggregate({
        where: { isDeleted: 0, rating: { gt: 0 } },
        _avg: { rating: true },
      }),
    ]);

  const rows: InstructorRow[] = instructors.map((ins: any) => {
    const courses = ins.taughtCourses;
    const totalStudents = courses.reduce(
      (sum: number, c: any) => sum + c._count.enrollments,
      0
    );
    const ratedCourses = courses.filter((c: any) => c.rating > 0);
    const avgRating =
      ratedCourses.length > 0
        ? ratedCourses.reduce((sum: number, c: any) => sum + c.rating, 0) /
          ratedCourses.length
        : 0;

    return {
      id: ins.id,
      name: ins.name,
      email: ins.email,
      courseCount: courses.length,
      studentCount: totalStudents,
      avgRating,
      status: ins.status,
      createdBy: ins.createdBy || "SYSTEM",
      createdDate: ins.createdDate.toISOString(),
      lastUpdatedBy: ins.lastUpdatedBy || "SYSTEM",
      lastUpdatedDate: ins.lastUpdatedDate.toISOString(),
    };
  });

  const platformAvgRating = ratingAggregate._avg.rating ?? 0;

  return { rows, totalCount, activeCourseCount, platformAvgRating };
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function AdminInstructorsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const { rows, totalCount, activeCourseCount, platformAvgRating } =
    await getInstructorData();

  const stats = [
    {
      label: "Total Instructors",
      value: totalCount.toLocaleString("id-ID"),
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Active Courses",
      value: activeCourseCount.toLocaleString("id-ID"),
      icon: BookOpen,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Avg. Rating",
      value: platformAvgRating > 0 ? platformAvgRating.toFixed(2) : "—",
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">
            Manage Instructors 👨‍🏫
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live data dari database
          </p>
        </div>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[2.5rem] border border-orange-50 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}
            >
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {s.label}
              </p>
              <h4 className="text-2xl font-black text-[#2D2D2D]">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Instructor Table */}
      <InstructorCRUD initialData={rows} />
    </main>
  );
}
