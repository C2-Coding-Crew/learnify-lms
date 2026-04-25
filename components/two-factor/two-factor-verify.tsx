"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertCircle, X, RotateCw, Smartphone, Mail, Send } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Mode = "totp" | "email-otp" | "backup";

const TwoFactorVerifyPage = () => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("totp");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [backupCode, setBackupCode] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus digit pertama saat mount atau ganti mode
  useEffect(() => {
    if (mode === "totp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  }, [mode]);

  // Countdown timer untuk resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Handle input digit per kotak ────────────────────────────────────────────
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== "") && newCode.join("").length === 6) {
      handleVerifyTotp(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      handleVerifyTotp(pasted);
    }
  };

  // ── Verifikasi TOTP (dari Authenticator app) ─────────────────────────────────
  const handleVerifyTotp = async (totpCode?: string) => {
    const finalCode = totpCode ?? code.join("");
    if (finalCode.length !== 6) {
      setError("Masukkan 6 digit kode dari Authenticator.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await authClient.twoFactor.verifyTotp({
        code: finalCode,
      });

      if (authError) {
        setError("Kode salah atau sudah kadaluarsa. Coba lagi.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
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

  // ── Kirim OTP ke Email ───────────────────────────────────────────────────────
  const handleSendEmailOtp = async () => {
    setIsSendingOtp(true);
    setError(null);
    setInfo(null);
    try {
      const { error: authError } = await authClient.twoFactor.sendOtp();

      if (authError) {
        setError("Gagal mengirim kode. Silakan coba lagi.");
        return;
      }

      setOtpSent(true);
      setCountdown(60); // cooldown 60 detik
      setInfo("Kode telah dikirim ke email kamu. Periksa inbox atau folder spam.");
    } catch {
      setError("Terjadi kesalahan saat mengirim kode.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Verifikasi OTP via Email ─────────────────────────────────────────────────
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await authClient.twoFactor.verifyOtp({
        code: emailOtp.trim(),
      });

      if (authError) {
        setError("Kode tidak valid atau sudah kadaluarsa. Minta kode baru.");
        setEmailOtp("");
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

  // ── Verifikasi Backup Code ───────────────────────────────────────────────────
  const handleVerifyBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await authClient.twoFactor.verifyBackupCode({
        code: backupCode.trim(),
      });

      if (authError) {
        setError("Backup code tidak valid atau sudah pernah digunakan.");
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

  // ── Switch mode helper ───────────────────────────────────────────────────────
  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
    setCode(["", "", "", "", "", ""]);
    setEmailOtp("");
    setBackupCode("");
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200 w-full max-w-[1100px] flex flex-col md:flex-row h-full max-h-[640px] relative animate-in fade-in duration-700 slide-in-from-bottom-5">

        {/* Tombol Close */}
        <Link href="/auth/login" className="absolute top-6 right-6 p-2.5 hover:bg-slate-100 rounded-full z-20 group transition-all">
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
            Verifikasi <br />
            <span className="text-[#FF6B4A]">Dua Langkah</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed z-10">
            Pilih metode verifikasi yang kamu inginkan untuk mengamankan akun.
          </p>

          {/* Method selector visual */}
          <div className="relative w-full max-w-[240px] flex flex-col gap-3 mt-8 z-10">
            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${mode === "totp" ? "bg-[#FF6B4A] shadow-lg shadow-orange-100" : "bg-white border border-slate-100"}`}>
              <Smartphone className={`w-5 h-5 ${mode === "totp" ? "text-white" : "text-slate-400"}`} />
              <span className={`text-sm font-bold ${mode === "totp" ? "text-white" : "text-slate-500"}`}>Authenticator App</span>
            </div>
            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${mode === "email-otp" ? "bg-[#FF6B4A] shadow-lg shadow-orange-100" : "bg-white border border-slate-100"}`}>
              <Mail className={`w-5 h-5 ${mode === "email-otp" ? "text-white" : "text-slate-400"}`} />
              <span className={`text-sm font-bold ${mode === "email-otp" ? "text-white" : "text-slate-500"}`}>Kode via Email</span>
            </div>
          </div>
        </div>

        {/* ── Right Side ────────────────────────────────────────────────────── */}
        <div className="w-full md:w-1/2 p-8 lg:p-14 bg-white flex flex-col justify-center overflow-y-auto">

          {/* ── TOTP Mode ──────────────────────────────────────────────────────── */}
          {mode === "totp" && (
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Authenticator App</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Buka <strong>Google Authenticator</strong> atau <strong>Authy</strong> dan masukkan kode 6 digit untuk{" "}
                  <span className="text-[#FF6B4A] font-semibold">Learnify LMS</span>.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 ${
                      digit
                        ? "border-[#FF6B4A] bg-orange-50 text-[#FF6B4A]"
                        : "border-slate-200 bg-slate-50 text-slate-800"
                    } focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 disabled:opacity-50`}
                  />
                ))}
              </div>

              <button
                onClick={() => handleVerifyTotp()}
                disabled={isLoading || code.some((d) => !d)}
                className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isLoading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><ShieldCheck className="w-4 h-4" />Verifikasi &amp; Masuk</>}
              </button>

              {/* Opsi lain */}
              <div className="flex flex-col gap-2 items-center">
                <button
                  onClick={() => switchMode("email-otp")}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-[#FF6B4A] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Gunakan kode via Email sebagai gantinya
                </button>
                <button
                  onClick={() => switchMode("backup")}
                  className="text-xs font-medium text-slate-400 hover:text-[#FF6B4A] transition-colors"
                >
                  Tidak bisa akses Authenticator? Gunakan backup code
                </button>
              </div>
            </>
          )}

          {/* ── Email OTP Mode ─────────────────────────────────────────────────── */}
          {mode === "email-otp" && (
            <>
              <button
                onClick={() => switchMode("totp")}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#FF6B4A] transition-colors mb-6 group w-fit"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Kembali ke Authenticator App
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Kode via Email</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Kami akan mengirim kode 6 digit ke <strong>email terdaftar</strong> kamu. Berlaku selama 10 menit.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {info && (
                <div className="mb-4 flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  {info}
                </div>
              )}

              {/* Tombol Kirim OTP */}
              {!otpSent ? (
                <button
                  onClick={handleSendEmailOtp}
                  disabled={isSendingOtp}
                  className="w-full h-12 border-2 border-[#FF6B4A] text-[#FF6B4A] hover:bg-orange-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
                >
                  {isSendingOtp
                    ? <div className="w-5 h-5 border-2 border-orange-300 border-t-[#FF6B4A] rounded-full animate-spin" />
                    : <><Send className="w-4 h-4" />Kirim Kode ke Email</>}
                </button>
              ) : (
                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div className="group">
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block group-focus-within:text-[#FF6B4A]">
                      Kode dari Email
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-center text-3xl font-bold font-mono tracking-[0.4em]"
                      maxLength={6}
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || emailOtp.length !== 6}
                    className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><ShieldCheck className="w-4 h-4" />Verifikasi &amp; Masuk</>}
                  </button>

                  {/* Resend */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-xs text-slate-400">Kirim ulang dalam <span className="font-bold text-slate-600">{countdown}s</span></p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={isSendingOtp}
                        className="text-xs font-medium text-[#FF6B4A] hover:underline disabled:opacity-50"
                      >
                        Kirim ulang kode
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* ── Backup Code Mode ────────────────────────────────────────────────── */}
          {mode === "backup" && (
            <>
              <button
                onClick={() => switchMode("totp")}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#FF6B4A] transition-colors mb-6 group w-fit"
              >
                <RotateCw className="w-4 h-4" />
                Kembali ke kode Authenticator
              </button>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Gunakan Backup Code</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Masukkan salah satu backup code yang kamu simpan saat mengaktifkan 2FA. Setiap backup code hanya bisa digunakan <strong>satu kali</strong>.
                </p>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyBackup} className="space-y-4">
                <div className="group">
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block group-focus-within:text-[#FF6B4A]">
                    Backup Code
                  </label>
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    placeholder="Contoh: a1b2c3d4e5f6"
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:border-[#FF6B4A] focus:bg-white focus:ring-2 focus:ring-orange-50 transition-all text-sm font-mono font-medium tracking-wider"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !backupCode.trim()}
                  className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : "Gunakan Backup Code"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorVerifyPage;
