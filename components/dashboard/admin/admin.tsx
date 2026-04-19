"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  UserCheck,
  GraduationCap,
  Wallet,
  Settings,
  LogOut,
  Activity,
  ShieldCheck,
  TrendingUp,
  Search,
  DollarSign,
  ChevronRight,
  ArrowUpRight,
  QrCode,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCodeLib from 'qrcode';

interface AdminDashboardProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function AdminDashboard({ userName, userEmail, userRole }: AdminDashboardProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // --- State Khusus 2FA ---
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(""); // Ubah nama biar gak bentrok
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      (window as any).authClient = authClient;
    }
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  const handleEnable2FA = async () => {
    try {
      const { data, error } = await authClient.twoFactor.enable({
        password: "" 
      });

      console.log("Full Result:", { data, error });

      if (data && data.totpURI) {
        // Generate gambar QR Code dari URI yang dikasih server
        const generatedQr = await QRCodeLib.toDataURL(data.totpURI);
        setQrCodeImage(generatedQr);
        setShow2FAModal(true);
      } else {
        console.error(error);
        alert("Gagal mengambil data 2FA. Cek console!");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem.");
    }
  };

  const handleVerify2FA = async () => {
    try {
      // Menggunakan casting 'as any' karena perbedaan typing di versi Better Auth
      const { data, error } = await (authClient.twoFactor as any).verifyOtp({
        code: twoFactorCode
      });

      if (data) {
        alert("Mantap Zi! 2FA Berhasil Aktif.");
        setShow2FAModal(false);
        setTwoFactorCode("");
      } else {
        console.error(error);
        alert("Kode salah atau kadaluwarsa!");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal verifikasi.");
    }
  };
  
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
    <div className="flex min-h-screen bg-[#FFFBF9] font-sans text-[#2D2D2D]">
      
      {/* --- MODAL 2FA OVERLAY --- */}
      {show2FAModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-orange-100 relative text-center">
            <button onClick={() => setShow2FAModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-orange-500">
              <X size={24} />
            </button>
            
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-black mb-2">Setup 2FA Security</h3>
            <p className="text-slate-400 text-xs font-bold mb-6">Scan QR di bawah dengan Google Authenticator</p>
            
            <div className="bg-orange-50 p-4 rounded-3xl inline-block mb-6 border-2 border-orange-100">
              {qrCodeImage && <img src={qrCodeImage} alt="QR Code" className="w-48 h-48" />}
            </div>

            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="000000"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 text-center text-2xl font-black tracking-[0.3em] focus:ring-2 focus:ring-orange-500 outline-none"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                maxLength={6}
              />
              <Button onClick={handleVerify2FA} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-100 border-none">
                Verifikasi Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR ADMIN --- */}
      <aside className="w-[280px] bg-white hidden xl:flex flex-col sticky top-0 h-screen border-r border-orange-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter block text-[#2D2D2D]">Learnify.</span>
            <span className="text-[10px] font-bold text-orange-600 tracking-[1.5px] uppercase leading-none">Super Admin</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1">
          <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-[2px] mb-4 mt-4">Monitoring System</p>
          {[
            { name: "Main Console", icon: LayoutDashboard, active: true },
            { name: "Manage Students", icon: GraduationCap },
            { name: "Manage Instructors", icon: UserCheck },
            { name: "Course Revenues", icon: Wallet },
            { name: "System Logs", icon: Activity },
          ].map((item) => (
            <button key={item.name} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-[14px] transition-all ${item.active ? "bg-orange-50 text-orange-600" : "text-slate-400 hover:bg-orange-50/50 hover:text-orange-600"}`}>
              <item.icon size={20} className={item.active ? "text-orange-600" : "text-slate-300"} />
              {item.name}
            </button>
          ))}

          <div className="pt-4 border-t border-slate-50 mt-4">
             <button onClick={handleEnable2FA} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-[14px] text-slate-400 hover:bg-green-50 hover:text-green-600 transition-all">
                <QrCode size={20} className="text-slate-300" />
                2FA Security
             </button>
          </div>
        </nav>

        <div className="p-6 m-4 bg-orange-50/50 rounded-[2rem] border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-orange-600 shadow-sm border border-orange-100">
              {userName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-[#2D2D2D] truncate">{userName}</p>
              <p className="text-[10px] text-orange-500 font-bold truncate italic uppercase tracking-tighter">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-orange-100 rounded-xl font-black text-[12px] transition-all shadow-sm">
            <LogOut size={16} /> Sign Out Panel
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <AdminStat label="Total Students" value={formatNumber(12540)} icon={<GraduationCap />} color="bg-orange-50 text-orange-600" trend="+12% bln ini" />
          <AdminStat label="Total Instructors" value={formatNumber(842)} icon={<UserCheck />} color="bg-amber-50 text-amber-600" trend="+5 hari ini" />
          <AdminStat label="Total Revenue" value={formatIDR(124500000)} icon={<DollarSign />} color="bg-green-50 text-green-600" trend="+24% target" />
          <AdminStat label="Active Courses" value={formatNumber(432)} icon={<TrendingUp />} color="bg-red-50 text-red-600" trend="12 butuh review" />
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
    </div>
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