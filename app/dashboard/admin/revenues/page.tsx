import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DollarSign, TrendingUp, ArrowUpRight, Download } from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

// ── Data Fetcher ──────────────────────────────────────────────────────────────
async function getRevenueData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRevenueAgg,
    thisMonthAgg,
    topCourses,
    recentInvoices,
  ] = await Promise.all([
    // Total revenue from paid invoices
    db.invoice.aggregate({
      where: { invoiceStatus: "paid", isDeleted: 0 },
      _sum: { totalAmount: true },
    }),

    // Revenue this month
    db.invoice.aggregate({
      where: {
        invoiceStatus: "paid",
        isDeleted: 0,
        createdDate: { gte: startOfMonth },
      },
      _sum: { totalAmount: true },
    }),

    // Top earning courses (by enrollment count × price as proxy)
    db.course.findMany({
      where: { isDeleted: 0, isPublished: true },
      select: {
        id: true,
        title: true,
        price: true,
        _count: { select: { enrollments: { where: { isDeleted: 0 } } } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),

    // Recent paid invoices — Invoice has no direct Course relation, join via user
    db.invoice.findMany({
      where: { invoiceStatus: "paid", isDeleted: 0 },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdDate: "desc" },
      take: 10,
    }),
  ]);

  const totalRevenue = Number(totalRevenueAgg._sum.totalAmount ?? 0);
  const thisMonthRevenue = Number(thisMonthAgg._sum.totalAmount ?? 0);
  // Instructor payout estimate: 60% of total revenue
  const instructorPayouts = Math.round(totalRevenue * 0.6);

  // Top courses with revenue calc
  const maxEnrollments = Math.max(
    ...topCourses.map((c) => c._count.enrollments),
    1
  );
  const topCoursesFormatted = topCourses.map((c: any) => ({
    name: c.title,
    revenue: c._count.enrollments * Number(c.price),
    students: c._count.enrollments,
    percent: Math.round((c._count.enrollments / maxEnrollments) * 100),
  }));

  // Recent transactions
  const transactions = recentInvoices.map((inv: any) => ({
    id: inv.id,
    course: inv.invoiceNumber,
    instructor: inv.user?.name ?? "—",
    amount: fmt(Number(inv.totalAmount)),
    date: (inv.createdDate as Date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  }));

  return {
    totalRevenue,
    thisMonthRevenue,
    instructorPayouts,
    topCoursesFormatted,
    transactions,
  };
}

// ── Page Component ────────────────────────────────────────────────────────────
export default async function AdminRevenuesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const {
    totalRevenue,
    thisMonthRevenue,
    instructorPayouts,
    topCoursesFormatted,
    transactions,
  } = await getRevenueData();

  const stats = [
    {
      label: "Total Revenue",
      value: fmt(totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "This Month",
      value: fmt(thisMonthRevenue),
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Instructor Payouts",
      value: fmt(instructorPayouts),
      icon: ArrowUpRight,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">
            Course Revenues 💵
          </h1>
          <p className="text-slate-400 text-sm font-bold mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live data dari Invoice DB
          </p>
        </div>
        <button className="h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 font-bold text-sm transition-colors shadow-lg shadow-orange-100">
          <script dangerouslySetInnerHTML={{ __html: `
            document.currentScript.parentElement.onclick = function() { window.print(); }
          `}} />
          <Download size={16} /> Export Report
        </button>
      </header>

      {/* Stats */}
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
              <h4 className="text-xl font-black text-[#2D2D2D]">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Earning Courses */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
          <h3 className="font-black text-[#2D2D2D] text-lg mb-6">
            Top Earning Courses
          </h3>
          {topCoursesFormatted.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">
              Belum ada data revenue.
            </p>
          ) : (
            <div className="space-y-5">
              {topCoursesFormatted.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-700 line-clamp-1 flex-1 mr-4">
                      {c.name}
                    </p>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-orange-600">
                        {fmt(c.revenue)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {c.students} students
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-orange-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
          <h3 className="font-black text-[#2D2D2D] text-lg mb-6">
            Recent Transactions
          </h3>
          {transactions.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-10">
              Belum ada transaksi.
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl hover:bg-orange-50/60 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-bold text-[#2D2D2D] truncate">
                      {t.course}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {t.instructor} · {t.date}
                    </p>
                  </div>
                  <span className="text-sm font-black text-green-600 shrink-0">
                    {t.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
