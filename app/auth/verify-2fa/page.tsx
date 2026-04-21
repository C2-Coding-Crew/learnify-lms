"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Verify2FAPage() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length < 6) return;

    setIsLoading(true);
    try {
      // Panggil verifikasi OTP ke Better Auth
      // Pakai 'as any' karena typing plugin sering gak kebaca di client
      const { data, error } = await (authClient.twoFactor as any).verifyOtp({
        code: code,
      });

      if (data) {
        // Berhasil! Lempar ke dashboard admin
        router.push("/dashboard/admin");
        router.refresh();
      } else {
        alert(error?.message || "Kode salah atau sudah kadaluwarsa, Zi!");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem, coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center p-6 font-sans text-[#2D2D2D]">
      <div className="max-w-md w-full">
        {/* Logo Area */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">Learnify.</h1>
        </div>

        {/* Card Area */}
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-orange-100/50 border border-orange-50 text-center">
          <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-orange-600">
            <ShieldCheck size={40} />
          </div>
          
          <h2 className="text-2xl font-black mb-2">Two-Factor Auth</h2>
          <p className="text-slate-400 text-sm font-bold mb-8 px-4">
            Keamanan tingkat tinggi aktif. Masukkan 6 digit kode dari aplikasi Authenticator kamu.
          </p>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000 000"
                maxLength={6}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] py-5 text-center text-3xl font-black tracking-[0.5em] focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all placeholder:text-slate-200"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <Button
              onClick={() => handleVerify()}
              disabled={isLoading || code.length < 6}
              className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Verifikasi & Masuk
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <button 
            onClick={() => authClient.signOut().then(() => router.push("/auth/login"))}
            className="mt-8 text-slate-400 hover:text-red-500 text-xs font-bold transition-colors uppercase tracking-widest"
          >
            Batal & Keluar Panel
          </button>
        </div>

        {/* Footer Info */}
        <p className="text-center mt-10 text-slate-300 text-[10px] font-black uppercase tracking-[2px]">
          Secure Session &bull; Protected by Learnify Engine
        </p>
      </div>
    </div>
  );
}