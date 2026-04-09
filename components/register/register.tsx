"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Chrome, ChevronRight, X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { registerSchema } from "@/lib/validations/auth";

const RegisterPage = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasi Zod di client
    const result = registerSchema.safeParse({ name: fullName, email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await authClient.signUp.email({
        name: fullName,
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (authError) {
        if (authError.code === "USER_ALREADY_EXISTS") {
          setError("Email sudah terdaftar. Silakan masuk menggunakan akun yang ada.");
        } else {
          setError("Gagal membuat akun. Silakan coba lagi.");
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-0 overflow-hidden select-none">
      <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200 w-full max-w-[1100px] flex flex-col md:flex-row h-full max-h-[650px] relative animate-in fade-in duration-700 slide-in-from-bottom-5">
        <Link
          href="/"
          className="absolute top-6 right-6 p-2.5 hover:bg-slate-100 rounded-full transition-all duration-300 z-20 group"
        >
          <X className="w-5 h-5 text-slate-400 group-hover:text-slate-700 group-hover:scale-110" />
        </Link>

        {/* --- LEFT SIDE --- */}
        <div className="hidden md:flex md:w-1/2 bg-[#FFF9F8] p-12 flex-col items-center justify-center text-center relative overflow-hidden border-r border-slate-50">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-100 rounded-full opacity-50 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-100 rounded-full opacity-50 blur-3xl" />

          <Link href="/" className="flex items-center gap-3 mb-8 group z-10">
            <div className="w-10 h-10 bg-[#FF6B4A] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 transition-transform group-hover:rotate-12 duration-300">
              <div className="w-5 h-5 bg-white rounded-sm rotate-45" />
            </div>
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Learnify<span className="text-[#FF6B4A]">.</span>
            </span>
          </Link>

          <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight z-10">
            Buat Akun <br />
            <span className="text-[#FF6B4A]">Mulai Belajar</span> Sekarang
          </h2>

          <div className="relative w-full aspect-square max-w-[280px] flex items-center justify-center z-10">
            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-purple-50 rounded-3xl flex flex-col items-center justify-center gap-4 p-10">
              <div className="w-16 h-16 bg-[#FF6B4A] rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-slate-800 font-bold text-sm">Bergabung Bersama Kami</p>
                <p className="text-slate-400 text-xs">20.000+ pelajar aktif</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-8 z-10">
            <div className="w-3 h-3 bg-orange-200 rounded-full" />
            <div className="w-3 h-3 bg-[#FF6B4A] rounded-full shadow-md shadow-orange-100" />
            <div className="w-3 h-3 bg-orange-200 rounded-full" />
          </div>
        </div>

        {/* --- RIGHT SIDE --- */}
        <div className="w-full md:w-1/2 p-8 lg:p-14 bg-white flex flex-col justify-center relative overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Daftar Akun Baru</h3>
            <p className="text-slate-500 text-sm">
              Lengkapi data di bawah untuk bergabung bersama kami.
            </p>
          </div>

          <button
            type="button"
            className="w-full h-11 border border-slate-200 rounded-xl flex items-center justify-center gap-3 text-slate-700 font-bold hover:bg-slate-50 transition-all mb-6 group shadow-sm"
          >
            <Chrome className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Daftar Cepat dengan Google</span>
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] bg-slate-100 flex-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atau</span>
            <div className="h-[1px] bg-slate-100 flex-1" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nama Lengkap */}
            <div className="group">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block group-focus-within:text-[#FF6B4A]">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#FF6B4A]" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 outline-none focus:border-[#FF6B4A] focus:bg-white focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block group-focus-within:text-[#FF6B4A]">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#FF6B4A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 outline-none focus:border-[#FF6B4A] focus:bg-white focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block group-focus-within:text-[#FF6B4A]">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#FF6B4A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter + angka + kapital"
                  className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-11 outline-none focus:border-[#FF6B4A] focus:bg-white focus:ring-2 focus:ring-orange-50 transition-all text-sm font-medium"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 group active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Daftar Sekarang
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs font-medium text-slate-500 mt-6">
            Sudah bergabung?{" "}
            <Link href="/auth/login" className="text-[#FF6B4A] font-bold hover:underline">
              Masuk ke Akun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
