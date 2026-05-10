"use client";

import TwoFactorSettings from "@/components/settings/two-factor-settings";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SecuritySettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B4A] transition-colors mb-6 font-bold text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Keamanan Akun</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola pengaturan keamanan untuk melindungi akunmu.
          </p>
        </div>
        <TwoFactorSettings />
      </div>
    </div>
  );
}
