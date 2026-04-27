"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  UserCheck,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminDashboardProps {
  userName: string;
  userEmail: string;
  userRole: string;
  twoFactorEnabled?: boolean;
  stats?: {
    studentCount: number;
    instructorCount: number;
    courseCount: number;
    totalRevenue: number;
  };
}

export default function AdminDashboard({ 
  userName, 
  userEmail, 
  userRole, 
  twoFactorEnabled = false,
  stats = { studentCount: 0, instructorCount: 0, courseCount: 0, totalRevenue: 0 } 
}: AdminDashboardProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatIDR = (amount: number) => {
    if (!isMounted) return "Rp ...";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (!isMounted) return "...";
    return num.toLocaleString("id-ID");
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">Admin Dashboard 📊</h1>
          <p className="text-slate-400 text-sm font-bold flex items-center gap-2 mt-1">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             Live analytics dari platform Learnify
          </p>
        </div>
      </header>

      {/* --- 2FA ALERT BANNER --- */}
      {!twoFactorEnabled && (
        <div className="mb-10 bg-gradient-to-r from-orange-500 to-[#FF6B4A] p-6 rounded-[2rem] text-white shadow-xl shadow-orange-200/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Amankan Akun Kamu! 🛡️</h2>
              <p className="text-white/80 text-sm max-w-md mt-0.5 font-medium leading-relaxed">
                Aktifkan Autentikasi Dua Faktor (2FA) sekarang untuk melindungi data belajar dan akses akunmu dari peretasan.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/dashboard/settings/security")}
            className="bg-white text-[#FF6B4A] hover:bg-slate-50 font-black px-8 py-6 rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-black/5 shrink-0 z-10"
          >
            Aktifkan Sekarang →
          </Button>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-[60px] opacity-50" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AdminStat label="Total Students" value={formatNumber(stats.studentCount)} icon={<GraduationCap />} color="bg-orange-50 text-orange-600" trend="+12% bln ini" />
        <AdminStat label="Total Instructors" value={formatNumber(stats.instructorCount)} icon={<UserCheck />} color="bg-amber-50 text-amber-600" trend="+5 hari ini" />
        <AdminStat label="Total Revenue" value={formatIDR(stats.totalRevenue)} icon={<DollarSign />} color="bg-green-50 text-green-600" trend="+24% target" />
        <AdminStat label="Active Courses" value={formatNumber(stats.courseCount)} icon={<TrendingUp />} color="bg-red-50 text-red-600" trend="12 butuh review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-50">
            <h3 className="font-black text-[#2D2D2D] text-lg mb-8">Top Course Earnings</h3>
            <div className="space-y-4">
               <p className="text-slate-400 italic text-sm text-center py-10">Revenue data is syncing...</p>
            </div>
         </div>
      </div>
    </main>
  );
}

function AdminStat({ label, value, icon, trend, color }: { label: string, value: string, icon: React.ReactNode, trend: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-orange-50 flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-default">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <h4 className="text-xl font-black text-[#2D2D2D] tracking-tight">{value}</h4>
        <div className="flex items-center gap-1 mt-1">
           <ArrowUpRight size={12} className="text-green-500" />
           <p className="text-[10px] font-black text-green-500">{trend}</p>
        </div>
      </div>
    </div>
  );
}