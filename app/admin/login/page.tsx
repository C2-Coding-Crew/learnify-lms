"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, Chrome, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { loginSchema } from "@/lib/validations/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard/admin",
      });
    } catch (err) {
      setError("Gagal masuk dengan Google.");
      setIsGoogleLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validasi input
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (authError) {
        setError(authError.message || "Email atau password admin salah.");
      } else {
        router.push("/dashboard/admin");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF6B4A] rounded-2xl mb-4 shadow-lg shadow-orange-200">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Learnify Admin Area</h1>
          <p className="text-slate-500">Masuk untuk mengelola sistem</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Social Login */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-bold rounded-xl flex items-center justify-center gap-3 transition-all mb-6"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-200 border-t-[#FF6B4A] rounded-full animate-spin" />
            ) : (
              <Chrome className="w-5 h-5 text-[#4285F4]" />
            )}
            Masuk dengan Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">Atau Email</span>
            </div>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Admin</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6B4A] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@learnify.id"
                  className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF6B4A] transition-all placeholder:text-slate-400 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#FF6B4A] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 text-slate-900 pl-12 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF6B4A] transition-all placeholder:text-slate-400 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-1">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 accent-[#FF6B4A] cursor-pointer rounded border-slate-300"
              />
              <label htmlFor="rememberMe" className="text-xs font-medium text-slate-600 cursor-pointer">
                Ingat saya di perangkat ini
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Masuk Admin <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm">
          &copy; 2026 Learnify LMS &bull; Area Terbatas Admin
        </p>
      </div>
    </div>
  );
}

