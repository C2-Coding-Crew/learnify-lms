import { DollarSign, TrendingUp, ArrowUpRight, Download } from "lucide-react";

export default async function AdminRevenuesPage() {
  const transactions = [
    { id: 1, course: "UI/UX Fundamentals",  instructor: "Dr. Ahmad Fauzi", amount: "Rp 450.000",  date: "12 Apr 2024", type: "sale" },
    { id: 2, course: "Figma Pro",            instructor: "Sarah Putri",      amount: "Rp 850.000",  date: "11 Apr 2024", type: "sale" },
    { id: 3, course: "React Masterclass",    instructor: "Ricky Hartono",    amount: "Rp 350.000",  date: "10 Apr 2024", type: "sale" },
    { id: 4, course: "UI/UX Fundamentals",  instructor: "Dr. Ahmad Fauzi", amount: "Rp 450.000",  date: "09 Apr 2024", type: "sale" },
    { id: 5, course: "Figma Pro",            instructor: "Sarah Putri",      amount: "Rp 850.000",  date: "08 Apr 2024", type: "sale" },
  ];

  const topCourses = [
    { name: "UI/UX Fundamentals", revenue: 45200000, students: 280, percent: 90 },
    { name: "Figma Pro",          revenue: 38500000, students: 190, percent: 75 },
    { name: "React Masterclass",  revenue: 28100000, students: 142, percent: 55 },
    { name: "Python Basics",      revenue: 12400000, students: 88,  percent: 30 },
  ];

  const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">Course Revenues 💵</h1>
            <p className="text-slate-400 text-sm font-bold mt-1">Monitor platform-wide revenue and payouts.</p>
          </div>
          <button className="h-11 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 font-bold text-sm transition-colors shadow-lg shadow-orange-100">
            <Download size={16} /> Export Report
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Revenue",      value: fmt(124500000), icon: DollarSign,  color: "text-green-600", bg: "bg-green-50" },
            { label: "This Month",         value: fmt(18400000),  icon: TrendingUp,   color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Instructor Payouts", value: fmt(74700000),  icon: ArrowUpRight, color: "text-blue-600",   bg: "bg-blue-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-orange-50 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}><s.icon size={24} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h4 className="text-xl font-black text-[#2D2D2D]">{s.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Courses */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
            <h3 className="font-black text-[#2D2D2D] text-lg mb-6">Top Earning Courses</h3>
            <div className="space-y-5">
              {topCourses.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-700">{c.name}</p>
                    <div className="text-right">
                      <p className="text-sm font-black text-orange-600">{fmt(c.revenue)}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{c.students} students</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-orange-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
            <h3 className="font-black text-[#2D2D2D] text-lg mb-6">Recent Transactions</h3>
            <div className="space-y-4">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-orange-50/30 rounded-2xl hover:bg-orange-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-[#2D2D2D]">{t.course}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{t.instructor} · {t.date}</p>
                  </div>
                  <span className="text-sm font-black text-green-600">{t.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
    </main>
  );
}
