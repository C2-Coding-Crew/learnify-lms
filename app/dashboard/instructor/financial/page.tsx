"use client";

import React, { useState, useEffect } from "react";
import InstructorHeader from "@/components/dashboard/instructor/header";
import { 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Landmark,
  History,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WithdrawalModal from "@/components/dashboard/instructor/financial/withdrawal-modal";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default function InstructorFinancialPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/instructor/withdrawals");
      const json = await res.json();
      if (json.withdrawals && Array.isArray(json.withdrawals)) {
        setData(json);
      } else {
        setData({ withdrawals: [], stats: { totalRevenue: 0, instructorShare: 0, availableBalance: 0 } });
        if (json.error) console.error(json.error);
      }
    } catch (err) {
      console.error(err);
      setData({ withdrawals: [], stats: { totalRevenue: 0, instructorShare: 0, availableBalance: 0 } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Clock className="animate-spin text-[#FF6B4A]" size={40} />
      </div>
    );
  }

  const stats = [
    { label: "Total Pendapatan", value: fmt(data?.stats.totalRevenue || 0), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "Bagi Hasil (60%)", value: fmt(data?.stats.instructorShare || 0), icon: ArrowUpRight, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Saldo Tersedia", value: fmt(data?.stats.availableBalance || 0), icon: Wallet, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-50 text-orange-500 border-orange-100";
      case "approved": return "bg-blue-50 text-blue-500 border-blue-100";
      case "completed": return "bg-green-50 text-green-600 border-green-100";
      case "rejected": return "bg-red-50 text-red-500 border-red-100";
      default: return "bg-slate-50 text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock size={14} />;
      case "approved": return <CheckCircle size={14} />;
      case "completed": return <CheckCircle size={14} />;
      case "rejected": return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <InstructorHeader 
        userName="Instructor" // This should ideally come from session but it's handled in the layout
        userRole="Instructor"
        title="Finansial & Payouts 💰"
        subtitle="Kelola pendapatan dan penarikan dana Anda."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h4 className="text-xl font-black text-slate-800">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Payout Action */}
        <div className="lg:col-span-1">
          <div className="bg-[#100E2E] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
             <div className="relative z-10">
               <h3 className="text-xl font-black mb-2">Tarik Pendapatan</h3>
               <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">
                 Minimal penarikan adalah Rp 50.000. Proses verifikasi admin memerlukan waktu 1-3 hari kerja.
               </p>
               
               <div className="space-y-4 mb-8">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                     <AlertCircle size={16} className="text-orange-400" />
                   </div>
                   <p className="text-[11px] font-bold text-slate-300">Biaya admin bank ditanggung instruktur</p>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                     <Landmark size={16} className="text-blue-400" />
                   </div>
                   <p className="text-[11px] font-bold text-slate-300">Support semua bank lokal Indonesia</p>
                 </div>
               </div>

               <Button 
                onClick={() => setIsModalOpen(true)}
                disabled={(data?.stats.availableBalance || 0) < 50000}
                className="w-full bg-[#FF6B4A] hover:bg-[#fa5a35] text-white h-14 rounded-2xl font-black text-sm shadow-xl shadow-orange-500/20 flex items-center gap-2"
               >
                 <Plus size={18} /> Ajukan Penarikan
               </Button>
             </div>
          </div>
        </div>

        {/* Right Column: Withdrawal History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-50 p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <History className="text-slate-400" /> Riwayat Penarikan
              </h3>
            </div>

            {data?.withdrawals.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
                  <Clock size={32} />
                </div>
                <p className="text-slate-400 font-bold text-sm">Belum ada riwayat penarikan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="text-left pb-3 font-black">Tanggal</th>
                      <th className="text-left pb-3 font-black">Bank / Rekening</th>
                      <th className="text-right pb-3 font-black">Jumlah</th>
                      <th className="text-center pb-3 font-black">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.withdrawals.map((w: any) => (
                      <tr key={w.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-3.5">
                          <p className="font-bold text-slate-700 text-xs">{new Date(w.createdDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[9px] text-slate-400">{new Date(w.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="py-3.5">
                          <p className="font-black text-slate-800 uppercase text-[10px]">{w.bankName}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{w.accountNumber} • {w.accountName}</p>
                        </td>
                        <td className="py-3.5 text-right font-black text-slate-800 text-xs">
                          {fmt(Number(w.amount))}
                        </td>
                        <td className="py-3.5">
                          <div className="flex justify-center">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(w.status)}`}>
                              {getStatusIcon(w.status)}
                              {w.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <WithdrawalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableBalance={data?.stats.availableBalance || 0}
        onSuccess={fetchData}
      />
    </main>
  );
}
