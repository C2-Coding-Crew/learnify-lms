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
  Star,
  Users,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AdminStats {
  totalStudents: number;
  totalInstructors: number;
  totalActiveCourses: number;
  totalRevenue: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface TopCourse {
  id: number;
  title: string;
  category: string;
  instructor: string;
  enrollments: number;
  revenue: number;
  rating: number;
  reviewCount: number;
}

interface AdminDashboardProps {
  userName: string;
  userEmail: string;
  userRole: string;
  twoFactorEnabled?: boolean;
  stats: AdminStats;
  monthlyRevenue: MonthlyRevenue[];
  topCourses: TopCourse[];
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-4 text-sm">
        <p className="font-black text-slate-700 mb-1">{label}</p>
        <p className="text-[#FF6B4A] font-bold">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard({
  userName,
  userEmail,
  userRole,
  twoFactorEnabled = false,
  stats,
  monthlyRevenue,
  topCourses,
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

  const hasRevenueData = monthlyRevenue.some((m) => m.revenue > 0);

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">Admin Dashboard 📊</h1>
          <p className="text-slate-400 text-sm font-bold flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live analytics dari platform Learnify
          </p>
        </div>
      </header>

      {/* 2FA Alert Banner */}
      {!twoFactorEnabled && (
        <div className="mb-10 bg-gradient-to-r from-orange-500 to-[#FF6B4A] p-6 rounded-[2rem] text-white shadow-xl shadow-orange-200/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Amankan Akun Kamu! 🛡️</h2>
              <p className="text-white/80 text-sm max-w-md mt-0.5 font-medium leading-relaxed">
                Aktifkan Autentikasi Dua Faktor (2FA) sekarang untuk melindungi data belajar dan akses akunmu.
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard/settings/security")}
            className="bg-white text-[#FF6B4A] hover:bg-slate-50 font-black px-8 py-6 rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-black/5 shrink-0 z-10"
          >
            Aktifkan Sekarang →
          </Button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-[60px] opacity-50" />
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <AdminStat
          label="Total Students"
          value={formatNumber(stats.totalStudents)}
          icon={<GraduationCap />}
          color="bg-orange-50 text-orange-600"
          trend={stats.totalStudents > 0 ? "terdaftar" : "Belum ada data"}
        />
        <AdminStat
          label="Total Instructors"
          value={formatNumber(stats.totalInstructors)}
          icon={<UserCheck />}
          color="bg-amber-50 text-amber-600"
          trend={stats.totalInstructors > 0 ? "aktif" : "Belum ada data"}
        />
        <AdminStat
          label="Total Revenue"
          value={formatIDR(stats.totalRevenue)}
          icon={<DollarSign />}
          color="bg-green-50 text-green-600"
          trend={stats.totalRevenue > 0 ? "dari invoice lunas" : "Belum ada pembayaran"}
        />
        <AdminStat
          label="Active Courses"
          value={formatNumber(stats.totalActiveCourses)}
          icon={<TrendingUp />}
          color="bg-red-50 text-red-600"
          trend={stats.totalActiveCourses > 0 ? "dipublikasikan" : "Belum ada kursus"}
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-50">
          <h3 className="font-black text-[#2D2D2D] text-lg mb-2">Pendapatan 6 Bulan Terakhir</h3>
          <p className="text-xs text-slate-400 font-medium mb-8">Berdasarkan invoice yang sudah lunas</p>

          {isMounted && (
            hasRevenueData ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyRevenue} barSize={32} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#CBD5E1", fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(0)}jt`
                        : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}rb`
                        : String(v)
                    }
                    width={48}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#FFF7F5" }} />
                  <Bar dataKey="revenue" fill="#FF6B4A" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <DollarSign size={24} className="text-orange-300" />
                </div>
                <p className="text-slate-400 font-bold text-sm">Belum ada pendapatan tercatat</p>
                <p className="text-slate-300 text-xs">Data akan muncul setelah ada transaksi yang lunas</p>
              </div>
            )
          )}
        </div>

        {/* Quick Stats Sidebar */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-50 flex flex-col gap-6">
          <h3 className="font-black text-[#2D2D2D] text-lg">Ringkasan Platform</h3>
          <div className="space-y-5">
            <QuickStat
              icon={<Users size={16} />}
              label="Rasio Instructor/Student"
              value={
                stats.totalInstructors > 0
                  ? `1 : ${Math.round(stats.totalStudents / stats.totalInstructors)}`
                  : "—"
              }
              color="text-blue-500 bg-blue-50"
            />
            <QuickStat
              icon={<BookOpen size={16} />}
              label="Rata-rata Enrollment/Kursus"
              value={
                stats.totalActiveCourses > 0
                  ? formatNumber(Math.round(stats.totalStudents / stats.totalActiveCourses))
                  : "—"
              }
              color="text-purple-500 bg-purple-50"
            />
            <QuickStat
              icon={<DollarSign size={16} />}
              label="Rata-rata Revenue/Kursus"
              value={
                stats.totalActiveCourses > 0
                  ? formatIDR(Math.round(stats.totalRevenue / stats.totalActiveCourses))
                  : "—"
              }
              color="text-green-500 bg-green-50"
            />
            <QuickStat
              icon={<GraduationCap size={16} />}
              label="Total User Aktif"
              value={formatNumber(stats.totalStudents + stats.totalInstructors)}
              color="text-orange-500 bg-orange-50"
            />
          </div>
        </div>
      </div>

      {/* Top Courses Table */}
      <div className="mt-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-orange-50">
        <h3 className="font-black text-[#2D2D2D] text-lg mb-6">Top 5 Kursus Terpopuler</h3>
        {topCourses.length === 0 ? (
          <p className="text-slate-400 italic text-sm text-center py-10">
            Belum ada kursus yang dipublikasikan.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
                  <th className="text-left pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kursus</th>
                  <th className="text-left pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Kategori</th>
                  <th className="text-right pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa</th>
                  <th className="text-right pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Rating</th>
                  <th className="text-right pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topCourses.map((course, idx) => (
                  <tr key={course.id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="py-4 pr-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black
                        ${idx === 0 ? "bg-yellow-100 text-yellow-600" :
                          idx === 1 ? "bg-slate-100 text-slate-500" :
                          idx === 2 ? "bg-orange-100 text-orange-500" :
                          "bg-slate-50 text-slate-400"}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="font-black text-slate-800 line-clamp-1">{course.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{course.instructor}</p>
                    </td>
                    <td className="py-4 pr-4 hidden md:table-cell">
                      <span className="text-[10px] font-black text-[#FF6B4A] bg-orange-50 px-2 py-1 rounded-lg">
                        {course.category}
                      </span>
                    </td>
                    <td className="py-4 text-right font-black text-slate-700">
                      <div className="flex items-center justify-end gap-1">
                        <Users size={12} className="text-slate-300" />
                        {formatNumber(course.enrollments)}
                      </div>
                    </td>
                    <td className="py-4 text-right hidden lg:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Star size={12} className="text-yellow-400" fill="currentColor" />
                        <span className="font-black text-slate-700">{course.rating.toFixed(1)}</span>
                        <span className="text-slate-300 text-[10px]">({course.reviewCount})</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className="font-black text-green-600 text-sm">
                        {formatIDR(course.revenue)}
                      </span>
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

// ─── Sub-components ───────────────────────────────────────────────────────────
function AdminStat({
  label,
  value,
  icon,
  trend,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
}) {
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

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{label}</p>
        <p className="font-black text-slate-800 text-sm truncate">{value}</p>
      </div>
    </div>
  );
}