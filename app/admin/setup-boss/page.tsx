"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { ShieldCheck, User, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSetupPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const adminEmail = "admin@learnify.id";
    const adminName = "Super Admin Learnify";

    try {
      // 1. Coba daftar secara resmi lewat sistem
      const { data, error } = await authClient.signUp.email({
        email: adminEmail,
        password: password,
        name: adminName,
        callbackURL: "/dashboard/admin",
      });

      if (error) {
        // Jika sudah ada, mungkin kita perlu update (biasanya signUp gagal kalau email sudah ada)
        setStatus({ type: "error", msg: error.message || "Pendaftaran gagal. Mungkin email sudah ada?" });
      } else {
        setStatus({ type: "success", msg: "Akun Admin Mandiri Berhasil Dibuat!" });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Terjadi kesalahan koneksi." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Setup Admin Utama</h1>
          <p className="text-slate-500 text-sm mt-1">Gunakan halaman ini untuk mendaftarkan akun admin secara resmi ke sistem</p>
        </div>

        {status && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm font-medium ${
            status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {status.msg}
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Admin (Tetap)</label>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-500 font-medium flex items-center gap-3">
              <User className="w-5 h-5" />
              admin@learnify.id
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Set Password Admin Baru</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Buat password kuat..."
                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
          >
            {isLoading ? "Sedang Mendaftarkan..." : (
              <>Daftarkan Admin <ArrowRight className="w-4 h-4" /></>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <a href="/admin/login" className="text-sm font-bold text-orange-600 hover:underline">Sudah punya akun? Ke Login Admin</a>
        </div>
      </div>
    </div>
  );
}
