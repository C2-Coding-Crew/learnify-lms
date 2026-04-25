import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Download } from "lucide-react";

export default async function InstructorEarningsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 3) {
    redirect("/dashboard");
  }

  const mockTransactions = [
    { id: 1, date: "12 Oct 2024", description: "Course Sale: UI/UX Fundamentals", amount: "+ Rp 450.000", type: "income", status: "completed" },
    { id: 2, date: "10 Oct 2024", description: "Withdrawal to Bank BCA", amount: "- Rp 2.500.000", type: "withdrawal", status: "completed" },
    { id: 3, date: "05 Oct 2024", description: "Course Sale: Figma Pro", amount: "+ Rp 850.000", type: "income", status: "completed" },
    { id: 4, date: "01 Oct 2024", description: "Course Sale: React Masterclass", amount: "+ Rp 350.000", type: "income", status: "completed" },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="Earnings & Payouts 💰" 
        subtitle="Track your revenue and manage withdrawals."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#100E2E] p-8 rounded-[2rem] text-white shadow-xl shadow-slate-200/50 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Wallet className="text-[#FF6B4A]" size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Available Balance</span>
            </div>
            <h4 className="text-3xl font-black mb-1">Rp 12.450.000</h4>
            <p className="text-sm font-medium text-green-400 flex items-center gap-1">
              <ArrowUpRight size={16} /> +14.5% this month
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#FF6B4A]/20 rounded-full blur-[50px] group-hover:bg-[#FF6B4A]/40 transition-all duration-700" />
        </div>

        {[
          { label: "Total Earnings", value: "Rp 45.200.000", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending Payout", value: "Rp 0", icon: ArrowDownRight, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <h4 className="text-3xl font-black text-slate-800">{stat.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-slate-800 text-lg">Transaction History</h3>
          <button className="h-11 px-6 bg-[#FF6B4A] hover:bg-[#fa5a36] text-white rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-md shadow-orange-100">
            <Download size={16} /> Withdraw Funds
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Date</th>
                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Description</th>
                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Amount</th>
                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((trx) => (
                <tr key={trx.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 text-sm font-bold text-slate-500">{trx.date}</td>
                  <td className="py-5 text-sm font-bold text-slate-800">{trx.description}</td>
                  <td className={`py-5 text-sm font-black ${trx.type === 'income' ? 'text-green-500' : 'text-slate-800'}`}>
                    {trx.amount}
                  </td>
                  <td className="py-5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-600 px-3 py-1 rounded-lg">
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
