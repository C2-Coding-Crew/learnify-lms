import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Search, MoreVertical, GraduationCap, Users, BookOpen, Filter } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StudentRow {
  id: string;
  name: string;
  email: string;
  enrolled: number;
  completed: number;
  joinedAt: string;
  status: "active" | "inactive";
}

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getStudentData() {
  const [students, totalCount, enrollmentStats] = await Promise.all([
    // List of students with enrollment counts
    db.user.findMany({
      where: { roleId: 2, isDeleted: 0 },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdDate: true,
        enrollments: {
          where: { isDeleted: 0 },
          select: {
            enrollmentStatus: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdDate: "desc" },
    }),

    // Total student count
    db.user.count({ where: { roleId: 2, isDeleted: 0 } }),

    // Average enrollments
    db.enrollment.groupBy({
      by: ["userId"],
      where: { isDeleted: 0 },
      _count: { id: true },
    }),
  ]);

  const rows: StudentRow[] = students.map((s: any) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    enrolled: s.enrollments.length,
    completed: s.enrollments.filter(
      (e: any) => e.enrollmentStatus === "completed" || e.completedAt !== null
    ).length,
    joinedAt: (s.createdDate as Date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status: s.status === 1 ? "active" : "inactive",
  }));

  const avgEnrollments =
    enrollmentStats.length > 0
      ? (
          enrollmentStats.reduce((sum, e) => sum + e._count.id, 0) /
          enrollmentStats.length
        ).toFixed(1)
      : "0";

  // Active students: those with at least 1 enrollment
  const activeStudents = rows.filter((r) => r.enrolled > 0).length;

  return { rows, totalCount, activeStudents, avgEnrollments };
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function AdminStudentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const { rows, totalCount, activeStudents, avgEnrollments } =
    await getStudentData();

  const stats = [
    {
      label: "Total Students",
      value: totalCount.toLocaleString("id-ID"),
      icon: GraduationCap,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Active Students",
      value: activeStudents.toLocaleString("id-ID"),
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Avg. Courses",
      value: avgEnrollments,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">
            Manage Students 🎓
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

      {/* Student Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-[#2D2D2D] text-lg">
            Student List{" "}
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
                placeholder="Search students..."
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
            <GraduationCap size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-bold">Belum ada student terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Student", "Enrolled", "Completed", "Joined", "Status", ""].map(
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
                {rows.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-50 last:border-none hover:bg-orange-50/30 transition-colors group"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#2D2D2D]">
                            {s.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {s.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-bold text-slate-600">
                      {s.enrolled} courses
                    </td>
                    <td className="py-4 text-sm font-bold text-green-600">
                      {s.completed} courses
                    </td>
                    <td className="py-4 text-xs font-bold text-slate-400">
                      {s.joinedAt}
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg ${
                          s.status === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {s.status}
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
