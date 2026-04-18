"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type FormState = "idle" | "loading" | "success" | "error";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Masukkan alamat email yang valid.");
      return;
    }

    setState("loading");
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/auth/reset-password",
      });

      if (error) {
        // Jangan bocorkan apakah email terdaftar atau tidak (security best practice)
        // Tampilkan pesan sukses meskipun email tidak ditemukan
        console.log("Forget password error:", error);
      }

      // Selalu tampilkan sukses — cegah user menebak email mana yang terdaftar
      setState("success");
    } catch {
      setState("error");
      setErrorMsg("Terjadi kesalahan server. Silakan coba lagi.");
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200 w-full max-w-[1100px] flex flex-col md:flex-row h-full max-h-[600px] relative animate-in fade-in duration-700 slide-in-from-bottom-5">

        {/* Tombol Close */}
        <Link
          href="/auth/login"
          className="absolute top-6 right-6 p-2.5 hover:bg-slate-100 rounded-full transition-all duration-300 z-20 group"
        >
          <X className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
        </Link>

        {/* ── Left Side ─────────────────────────────────────────────────────── */}
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
            Lupa <br />
            <span className="text-[#FF6B4A]">Password?</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed z-10">
            Tenang, kami akan kirimkan link reset ke email kamu dalam hitungan detik.
          </p>

          {/* Illustration */}
          <div className="relative w-full aspect-square max-w-[220px] flex items-center justify-center z-10 mt-6">
            <div className="w-full h-full bg-gradient-to-br from-orange-50 to-purple-50 rounded-3xl flex flex-col items-center justify-center gap-5 p-8">
              <div className="w-16 h-16 bg-[#FF6B4A] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-slate-800 font-bold text-sm">Cek Inbox Email</p>
                <p className="text-slate-400 text-xs">Link aktif selama 1 jam</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Side ────────────────────────────────────────────────────── */}
        <div className="w-full md:w-1/2 p-8 lg:p-14 bg-white flex flex-col justify-center">

          {/* Back to Login */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#FF6B4A] transition-colors mb-8 group w-fit"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Kembali ke Login
          </Link>

          {state !== "success" ? (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Masukkan email yang terdaftar. Kami akan kirimkan link untuk membuat password baru.
                </p>
              </div>

              {/* Error Message */}
              {(state === "error" || errorMsg) && (
                <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errorMsg || "Terjadi kesalahan. Silakan coba lagi."}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="group">
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block group-focus-within:text-[#FF6B4A]">
                    Alamat Email Terdaftar
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
                      disabled={state === "loading"}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {state === "loading" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Mengirim Email...</span>
                    </>
                  ) : (
                    "Kirim Link Reset Password"
                  )}
                </button>
              </form>

              <p className="text-center text-xs font-medium text-slate-400 mt-8">
                Ingat password kamu?{" "}
                <Link href="/auth/login" className="text-[#FF6B4A] font-bold hover:underline">
                  Masuk Sekarang
                </Link>
              </p>
            </>
          ) : (
            /* ── Success State ──────────────────────────────────────────────── */
            <div className="flex flex-col items-center text-center py-6">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Email Terkirim! 📬</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-[300px] mb-2">
                Kami sudah mengirim link reset password ke:
              </p>
              <p className="text-[#FF6B4A] font-bold text-sm mb-6">{email}</p>

              <div className="bg-slate-50 rounded-2xl p-5 text-left w-full max-w-[340px] mb-8 space-y-2">
                <p className="text-xs font-bold text-slate-700 mb-3">Langkah selanjutnya:</p>
                {[
                  "Buka aplikasi email kamu",
                  "Cari email dari Learnify LMS",
                  "Klik tombol \"Reset Password Sekarang\"",
                  "Link aktif selama 1 jam",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-[#FF6B4A] text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-600">{step}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Tidak menerima email? Cek folder Spam atau junk mail.
              </p>

              <button
                onClick={() => { setState("idle"); setEmail(""); }}
                className="text-xs font-bold text-[#FF6B4A] hover:underline"
              >
                Kirim ulang ke email lain
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
