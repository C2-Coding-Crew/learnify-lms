"use client";

import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  Landmark,
  Search,
  MoreVertical,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminPayoutsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/withdrawals");
      const json = await res.json();
      if (Array.isArray(json)) {
        setWithdrawals(json);
      } else {
        setWithdrawals([]);
        if (json.error) toast.error(json.error);
      }
    } catch (err) {
      console.error(err);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Gagal memperbarui status");
      
      toast.success(`Penarikan berhasil di-${status}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = withdrawals.filter(w => 
    w.instructor.name.toLowerCase().includes(search.toLowerCase()) ||
    w.bankName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-50 text-orange-500 border-orange-100";
      case "approved": return "bg-blue-50 text-blue-500 border-blue-100";
      case "completed": return "bg-green-50 text-green-600 border-green-100";
      case "rejected": return "bg-red-50 text-red-500 border-red-100";
      default: return "bg-slate-50 text-slate-400";
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Payout Moderation 💸
        </h1>
        <p className="text-slate-400 text-sm font-bold mt-1">
          Review dan proses permintaan penarikan dana dari instruktur.
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari instruktur atau bank..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-xs font-black uppercase tracking-wider">
              {withdrawals.filter(w => w.status === "pending").length} Pending
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="animate-spin text-[#FF6B4A]" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
              <Wallet size={32} />
            </div>
            <p className="text-slate-400 font-bold">Tidak ada data penarikan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="text-left pb-3 font-black pl-2">Instruktur</th>
                  <th className="text-left pb-3 font-black">Bank Detail</th>
                  <th className="text-right pb-3 font-black">Jumlah</th>
                  <th className="text-center pb-3 font-black">Status</th>
                  <th className="text-right pb-3 font-black pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((w) => (
                  <tr key={w.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 text-xs shrink-0">
                          {w.instructor.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-800 text-xs truncate">{w.instructor.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium truncate">{w.instructor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Landmark size={12} className="text-slate-400" />
                        <p className="font-black text-slate-800 uppercase text-[10px]">{w.bankName}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{w.accountNumber} • {w.accountName}</p>
                    </td>
                    <td className="py-3.5 text-right font-black text-slate-800 text-xs">
                      {fmt(Number(w.amount))}
                    </td>
                    <td className="py-3.5">
                      <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(w.status)}`}>
                          {w.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 text-right pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical size={16} className="text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-xl border-slate-100 p-2 min-w-[160px]">
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(w.id, "approved")}
                            className="flex items-center gap-2 p-2.5 text-blue-600 font-bold rounded-lg cursor-pointer hover:bg-blue-50"
                          >
                            <CheckCircle size={16} /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(w.id, "completed")}
                            className="flex items-center gap-2 p-2.5 text-green-600 font-bold rounded-lg cursor-pointer hover:bg-green-50"
                          >
                            <CheckCircle size={16} /> Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(w.id, "rejected")}
                            className="flex items-center gap-2 p-2.5 text-red-600 font-bold rounded-lg cursor-pointer hover:bg-red-50"
                          >
                            <XCircle size={16} /> Reject Request
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
