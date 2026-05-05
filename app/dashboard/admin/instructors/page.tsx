import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Search, MoreVertical, UserCheck, BookOpen, Star, Filter } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface InstructorRow {
  id: string;
  name: string;
  email: string;
  courseCount: number;
  studentCount: number;
  avgRating: number;
  joinedAt: string;
  status: "active" | "inactive";
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
          createdDate: true,
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
      joinedAt: (ins.createdDate as Date).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: ins.status === 1 ? "active" : "inactive",
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
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-[#2D2D2D] text-lg">
            Instructor List{" "}
            <span className="text-sm font-bold text-slate-400 ml-2">
              ({totalCount} total)
            </span>
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search instructors..."
                className="pl-11 pr-4 h-11 bg-orange-50/40 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-orange-200 w-56 font-medium transition-all"
              />
            </div>
            <button className="h-11 px-4 bg-orange-50 text-orange-600 rounded-xl flex items-center gap-2 font-bold text-sm hover:bg-orange-100 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <UserCheck size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-bold">Belum ada instructor terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Instructor", "Courses", "Students", "Rating", "Joined", "Status", ""].map(
                    (h, i) => (
                      <th
                        key={i}
                        className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((ins) => (
                  <tr
                    key={ins.id}
                    className="border-b border-slate-50 last:border-none hover:bg-orange-50/30 transition-colors group"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                          {ins.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#2D2D2D]">
                            {ins.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {ins.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-bold text-slate-600">
                      {ins.courseCount}
                    </td>
                    <td className="py-4 text-sm font-bold text-slate-600">
                      {ins.studentCount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-black text-yellow-500 flex items-center gap-1">
                        ⭐ {ins.avgRating > 0 ? ins.avgRating.toFixed(1) : "—"}
                      </span>
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-400">
                      {ins.joinedAt}
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg ${
                          ins.status === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {ins.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50">
                        <MoreVertical size={16} />
                      </button>
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
