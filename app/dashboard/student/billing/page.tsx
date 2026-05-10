import { CreditCard, Download, Clock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  const invoices = await db.invoice.findMany({
    where: { userId, isDeleted: 0 },
    orderBy: { createdDate: "desc" },
    include: {
      course: { select: { title: true } }
    }
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-50 text-green-600 border-green-100";
      case "pending": return "bg-orange-50 text-orange-600 border-orange-100";
      case "cancelled": return "bg-red-50 text-red-600 border-red-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return <CheckCircle2 size={14} />;
      case "pending": return <Clock size={14} />;
      case "cancelled": return <AlertCircle size={14} />;
      default: return null;
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1200px] mx-auto w-full font-sans">
      <Link 
        href="/dashboard/student"
        className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B4A] transition-colors mb-8 font-bold text-sm group w-fit"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Dashboard
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Invoices 💳</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          Manage your course purchases and payment history.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
            {[
                { label: "Total Spent", value: `Rp ${invoices.filter(i => i.invoiceStatus === "paid").reduce((sum, i) => sum + Number(i.totalAmount), 0).toLocaleString()}`, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Pending Payments", value: `${invoices.filter(i => i.invoiceStatus === "pending").length}`, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
                { label: "Courses Purchased", value: `${new Set(invoices.filter(i => i.invoiceStatus === "paid").map(i => i.courseId)).size}`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <h4 className="text-2xl font-black text-slate-800">{stat.value}</h4>
                    </div>
                </div>
            ))}
        </div>

        {/* Invoice Table */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
            <div className="p-8">
                <h3 className="font-black text-slate-800 text-lg mb-6">Transaction History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Invoice #</th>
                                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Course</th>
                                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Date</th>
                                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Amount</th>
                                <th className="pb-4 font-black text-[11px] uppercase tracking-widest text-slate-400">Status</th>
                                <th className="pb-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-5 font-bold text-slate-900 text-sm">{inv.invoiceNumber}</td>
                                        <td className="py-5 text-sm font-bold text-slate-700">{inv.course?.title || "N/A"}</td>
                                        <td className="py-5 text-xs text-slate-400 font-medium">
                                            {inv.createdDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                        <td className="py-5 text-sm font-black text-slate-800">
                                            Rp {Number(inv.totalAmount).toLocaleString()}
                                        </td>
                                        <td className="py-5">
                                            <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(inv.invoiceStatus)}`}>
                                                {getStatusIcon(inv.invoiceStatus)}
                                                {inv.invoiceStatus}
                                            </span>
                                        </td>
                                        <td className="py-5 text-right">
                                            {inv.invoiceStatus === "paid" ? (
                                                <button className="h-9 px-4 bg-slate-50 text-slate-600 rounded-xl font-bold text-[10px] hover:bg-slate-100 transition-colors flex items-center gap-1.5 ml-auto">
                                                    <Download size={12} /> Receipt
                                                </button>
                                            ) : inv.invoiceStatus === "pending" ? (
                                                <Link 
                                                  href={`/checkout/${inv.invoiceNumber}`}
                                                  className="h-9 px-4 bg-[#FF6B4A] text-white rounded-xl font-bold text-[10px] hover:bg-[#fa5a36] transition-colors flex items-center gap-1.5 ml-auto shadow-md shadow-orange-100"
                                                >
                                                    Pay Now
                                                </Link>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
