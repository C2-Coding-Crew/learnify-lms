import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Activity, Users, BookOpen, ShoppingCart, CheckCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ActivityItem {
  id: string;
  level: "info" | "success" | "warning";
  message: string;
  actor: string;
  time: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  return `${days} hari lalu`;
}

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getActivityData() {
  const [
    totalUsers,
    newUsersCount,
    totalEnrollments,
    recentUsers,
    recentEnrollments,
    pendingCourses,
    recentCompletions,
  ] = await Promise.all([
    // Total all users
    db.user.count({ where: { isDeleted: 0 } }),

    // New users in last 7 days
    db.user.count({
      where: {
        isDeleted: 0,
        createdDate: {
          gte: new Date(Date.now() - 7 * 86_400_000),
        },
      },
    }),

    // Total enrollments
    db.enrollment.count({ where: { isDeleted: 0 } }),

    // Recent user registrations (last 10)
    db.user.findMany({
      where: { isDeleted: 0 },
      select: { id: true, name: true, email: true, roleId: true, createdDate: true },
      orderBy: { createdDate: "desc" },
      take: 10,
    }),

    // Recent enrollments (last 10)
    db.enrollment.findMany({
      where: { isDeleted: 0 },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { enrolledAt: "desc" },
      take: 10,
    }),

    // Pending course approvals
    db.course.count({
      where: { isPublished: false, isDeleted: 0, status: 1 },
    }),

    // Recent course completions
    db.enrollment.findMany({
      where: {
        isDeleted: 0,
        enrollmentStatus: "completed",
      },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
  ]);

  // ── Build unified activity feed ───────────────────────────────────────────
  const activities: ActivityItem[] = [];

  for (const u of recentUsers) {
    const roleLabel =
      u.roleId === 2 ? "Instructor" : u.roleId === 1 ? "Admin" : "Student";
    activities.push({
      id: `user-${u.id}`,
      level: "info",
      message: `User baru mendaftar sebagai ${roleLabel}: ${u.email}`,
      actor: u.name,
      time: relativeTime(u.createdDate as Date),
    });
  }

  for (const enr of recentEnrollments as any[]) {
    activities.push({
      id: `enr-${enr.id}`,
      level: "success",
      message: `Enrollment baru: "${enr.course.title}"`,
      actor: enr.user.name,
      time: relativeTime(enr.enrolledAt as Date),
    });
  }

  for (const comp of recentCompletions as any[]) {
    activities.push({
      id: `comp-${comp.id}`,
      level: "success",
      message: `Menyelesaikan kursus: "${comp.course.title}"`,
      actor: comp.user.name,
      time: comp.completedAt
        ? relativeTime(comp.completedAt as Date)
        : "Recently",
    });
  }

  if (pendingCourses > 0) {
    activities.push({
      id: "pending-approval",
      level: "warning",
      message: `${pendingCourses} kursus menunggu persetujuan admin`,
      actor: "System",
      time: "Now",
    });
  }

  // Sort by recency (approximate — we already have relative time strings,
  // so just keep insertion order which is DB desc)
  return {
    activities: activities.slice(0, 20),
    totalUsers,
    newUsersCount,
    totalEnrollments,
    pendingCourses,
  };
}

// ── Level Config ──────────────────────────────────────────────────────────────
const LEVEL_STYLE = {
  info: {
    bg: "hover:bg-blue-50/30",
    text: "text-blue-600",
    badge: "bg-blue-50 text-blue-600",
    label: "info",
    icon: Activity,
  },
  success: {
    bg: "hover:bg-green-50/30",
    text: "text-green-600",
    badge: "bg-green-50 text-green-600",
    label: "success",
    icon: CheckCircle,
  },
  warning: {
    bg: "hover:bg-yellow-50/30",
    text: "text-yellow-600",
    badge: "bg-yellow-50 text-yellow-600",
    label: "warning",
    icon: Activity,
  },
} as const;

// ── Page Component ────────────────────────────────────────────────────────────
export default async function AdminLogsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const { activities, totalUsers, newUsersCount, totalEnrollments, pendingCourses } =
    await getActivityData();

  const stats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString("id-ID"),
      icon: Users,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      label: "New This Week",
      value: newUsersCount.toLocaleString("id-ID"),
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Enrollments",
      value: totalEnrollments.toLocaleString("id-ID"),
      icon: BookOpen,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Pending Approvals",
      value: pendingCourses.toString(),
      icon: ShoppingCart,
      color: pendingCourses > 0 ? "text-yellow-600" : "text-slate-400",
      bg: pendingCourses > 0 ? "bg-yellow-50" : "bg-slate-50",
    },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">
            System Activity 🗃️
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live activity dari database
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[2.5rem] border border-orange-50 shadow-sm flex items-center gap-4 hover:scale-[1.02] transition-transform"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}
            >
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {s.label}
              </p>
              <h4 className="text-xl font-black text-[#2D2D2D]">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
        <h3 className="font-black text-[#2D2D2D] text-lg mb-8">
          Recent Activity Feed
        </h3>

        {activities.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Activity size={40} className="mx-auto mb-3 text-slate-200" />
            <p className="font-bold">Belum ada aktivitas tercatat.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((log) => {
              const style = LEVEL_STYLE[log.level];
              const Icon = style.icon;
              return (
                <div
                  key={log.id}
                  className={`flex items-start gap-4 px-5 py-4 rounded-2xl transition-colors ${style.bg} border border-transparent hover:border-slate-100`}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${style.text}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-xs font-bold leading-relaxed">
                      {log.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      {log.actor} · {log.time}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex-shrink-0 ${style.badge}`}
                  >
                    {style.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
