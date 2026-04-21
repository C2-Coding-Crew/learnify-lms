"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, GraduationCap, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client"; // Pastikan import ini ada

export default function SelectRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    {
      id: 2, // Student
      title: "Learning Enthusiast",
      label: "Siswa",
      desc: "Akses ribuan modul berkualitas dan tingkatkan karier Anda.",
      icon: <GraduationCap size={48} />,
      accent: "bg-[#FF6B4A]",
      lightAccent: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      id: 3, // Mentor/Instructor
      title: "Expert Instructor",
      label: "Pengajar",
      desc: "Bangun komunitas belajar dan monetisasi keahlian Anda.",
      icon: <User size={48} />,
      accent: "bg-[#100E2E]",
      lightAccent: "bg-slate-100",
      border: "border-slate-300",
    },
  ];

const handleAction = async () => {
  if (!selectedRole) return;
  setIsLoading(true);

  try {
    const session = await authClient.getSession();
    
    // CEK: Jika user SUDAH login DAN sudah punya data lengkap di DB
    if (session?.data?.user) {
      const { error } = await authClient.updateUser({
        // @ts-ignore
        roleId: selectedRole, // Update role sesuai pilihan user
      });

      if (!error) {
        // Arahkan sesuai role yang kamu tentukan (3 untuk Instructor)
        const targetPath = selectedRole === 3 ? "/dashboard/instructor" : "/dashboard/student";
        router.push(targetPath);
        router.refresh();
        return;
      }
    }

    // JIKA user BELUM login atau ingin daftar baru, PAKSA ke halaman register
    // Kita bawa roleId-nya lewat URL agar di halaman daftar nanti otomatis terpilih
    router.push(`/auth/register?roleId=${selectedRole}`);

  } catch (err) {
    console.error("Gagal memproses:", err);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="mb-12 flex items-center gap-2">
        <div className="w-8 h-8 bg-[#FF6B4A] rounded-lg flex items-center justify-center rotate-45">
          <div className="w-3 h-3 bg-white rounded-sm" />
        </div>
        <span className="text-xl font-black tracking-tighter text-slate-800">Learnify.</span>
      </div>

      <div className="max-w-4xl w-full">
        <div className="text-center mb-16 space-y-3">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Selamat Datang di <span className="text-[#FF6B4A]">Pintu Masa Depan.</span>
          </h1>
          <p className="text-slate-400 font-medium">Pilih peran Anda untuk menyesuaikan pengalaman belajar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`group relative cursor-pointer overflow-hidden rounded-[3rem] border-4 transition-all duration-500 ${
                selectedRole === role.id 
                ? `${role.border} shadow-2xl shadow-slate-200 bg-white` 
                : "border-slate-50 bg-slate-50/50 hover:border-slate-100"
              }`}
            >
              <div className="p-10 flex flex-col h-full items-center text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${
                  selectedRole === role.id ? `${role.accent} text-white` : `${role.lightAccent} text-slate-400 group-hover:scale-110`
                }`}>
                  {role.icon}
                </div>

                <div className="space-y-2 mb-8">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedRole === role.id ? "text-[#FF6B4A]" : "text-slate-400"}`}>
                    {role.label}
                  </span>
                  <h3 className="text-2xl font-black text-slate-800">{role.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-[200px] mx-auto">
                    {role.desc}
                  </p>
                </div>

                <div className={`mt-auto transition-all duration-300 ${selectedRole === role.id ? "opacity-100 scale-110" : "opacity-0 scale-50"}`}>
                  <CheckCircle2 className="text-[#FF6B4A]" size={32} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-6">
          <button
            onClick={handleAction}
            disabled={!selectedRole || isLoading}
            className={`group flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm transition-all shadow-xl ${
              selectedRole && !isLoading
              ? "bg-[#100E2E] text-white hover:bg-[#FF6B4A] hover:translate-y-[-4px]" 
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Mulai Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
            Bantuan Pengguna
          </button>
        </div>
      </div>
    </div>
  );
}