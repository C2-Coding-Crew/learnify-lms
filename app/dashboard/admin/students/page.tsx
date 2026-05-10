import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Search, MoreVertical, GraduationCap, Users, BookOpen, Filter } from "lucide-react";

import StudentCRUD from "@/components/dashboard/admin/users/student-crud";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StudentRow {
  id: string;
  name: string;
  email: string;
  enrolled: number;
  completed: number;
  status: number;
  createdBy: string;
  createdDate: string;
  lastUpdatedBy: string;
  lastUpdatedDate: string;
}

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getStudentData() {
  const [students, totalCount, enrollmentStats] = await Promise.all([
    // List of students with enrollment counts
    db.user.findMany({
      where: { roleId: 3, isDeleted: 0 },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdBy: true,
        createdDate: true,
        lastUpdatedBy: true,
        lastUpdatedDate: true,
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
    db.user.count({ where: { roleId: 3, isDeleted: 0 } }),

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
    status: s.status,
    createdBy: s.createdBy || "SYSTEM",
    createdDate: s.createdDate.toISOString(),
    lastUpdatedBy: s.lastUpdatedBy || "SYSTEM",
    lastUpdatedDate: s.lastUpdatedDate.toISOString(),
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
      <StudentCRUD initialData={rows} />
    </main>
  );
}
