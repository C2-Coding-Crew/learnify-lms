import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-xl shadow-slate-200/50 text-center animate-in zoom-in-95 duration-500">
        
        {/* Icon Container */}
        <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20" />
          <ShieldAlert className="w-12 h-12 text-red-500 relative z-10" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Akses Ditolak
        </h1>
        
        <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-8">
          Maaf, Anda tidak memiliki izin (role) yang diperlukan untuk mengakses halaman ini. 
          Silakan kembali ke dashboard utama Anda.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 group">
              <Home className="w-4 h-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
          <Link href="/auth/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Ganti Akun
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400">
            Merasa ini sebuah kesalahan? Hubungi <span className="text-[#FF6B4A]">support@learnify.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
