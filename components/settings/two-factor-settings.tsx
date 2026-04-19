"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, ShieldOff, Eye, EyeOff, Copy, Check, AlertCircle, Lock, Chrome } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import QRCode from "qrcode";

// ── Flow yang benar sesuai Better Auth: ──────────────────────────────────────
// 1. getTotpUri({ password }) → dapat QR code
// 2. User scan QR di Authenticator
// 3. enable({ password, code }) → verifikasi SEKALIGUS aktifkan 2FA
// ─────────────────────────────────────────────────────────────────────────────

type SetupStep = "idle" | "confirm-password" | "scan-and-verify" | "show-backup";
type DisableStep = "idle" | "confirm-disable";

const TwoFactorSettings = () => {
  const { data: session } = useSession();
  const is2FAEnabled = (session?.user as { twoFactorEnabled?: boolean })?.twoFactorEnabled ?? false;

  // ── Deteksi tipe akun (Google vs Email/Password) ─────────────────────────────
  const [hasCredentialAccount, setHasCredentialAccount] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccountType = async () => {
      try {
        const { data: accounts } = await authClient.listAccounts();
        const hasCredential = accounts?.some(
          (acc: { providerId: string }) => acc.providerId === "credential"
        ) ?? false;
        setHasCredentialAccount(hasCredential);
      } catch {
        setHasCredentialAccount(true);
      }
    };
    if (session?.user) checkAccountType();
  }, [session]);

  // ── Enable Flow State ────────────────────────────────────────────────────────
  const [setupStep, setSetupStep] = useState<SetupStep>("idle");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  // ── Disable Flow State ───────────────────────────────────────────────────────
  const [disableStep, setDisableStep] = useState<DisableStep>("idle");
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSocialOnly = hasCredentialAccount === false;

  // ── Step 1: Ambil TOTP URI / QR Code ─────────────────────────────────────────
  // Menggunakan getTotpUri (bukan enable) agar tidak ada side effect sebelum verify
  const handleGetQrCode = async (pwd: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await authClient.twoFactor.getTotpUri(
        pwd ? { password: pwd } : { password: "" }
      );

      if (authError || !data) {
        setError(authError?.message ?? "Gagal mengambil QR code. Coba lagi.");
        return;
      }

      const uri = data.totpURI;
      setTotpUri(uri);
      const qr = await QRCode.toDataURL(uri, { width: 240, margin: 2 });
      setQrCodeDataUrl(qr);
      setSetupStep("scan-and-verify");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetQrWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    await handleGetQrCode(password);
  };

  const handleGetQrSocial = async () => {
    await handleGetQrCode("");
  };

  // ── Step 2: Verifikasi kode SEKALIGUS aktifkan 2FA ────────────────────────────
  // enable() di sini menerima { code, password } untuk verifikasi final
  const handleVerifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (verifyCode.length !== 6) {
      setError("Masukkan 6 digit kode dari Authenticator.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = isSocialOnly
        ? { password: "", code: verifyCode }
        : { password, code: verifyCode };

      const { data, error: authError } = await authClient.twoFactor.enable(payload as Parameters<typeof authClient.twoFactor.enable>[0]);

      if (authError || !data) {
        if (authError?.message?.toLowerCase().includes("invalid") ||
            authError?.message?.toLowerCase().includes("expired")) {
          setError(
            "Kode salah atau sudah kadaluarsa. Pastikan jam HP dan laptop sudah sinkron, lalu coba lagi dengan kode baru dari Authenticator."
          );
        } else {
          setError(authError?.message ?? "Gagal mengaktifkan 2FA. Coba lagi.");
        }
        setVerifyCode("");
        return;
      }

      // Simpan backup codes jika ada
      if (data.backupCodes?.length) {
        setBackupCodes(data.backupCodes);
        setSetupStep("show-backup");
      } else {
        window.location.reload();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Disable 2FA ──────────────────────────────────────────────────────────────
  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { error: authError } = await authClient.twoFactor.disable(
        isSocialOnly ? { password: "" } : { password: disablePassword }
      );

      if (authError) {
        setError(authError.message ?? "Gagal menonaktifkan 2FA.");
        return;
      }

      setDisableStep("idle");
      setDisablePassword("");
      window.location.reload();
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Copy backup codes ────────────────────────────────────────────────────────
  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${is2FAEnabled ? "bg-green-50" : "bg-slate-100"}`}>
          {is2FAEnabled
            ? <ShieldCheck className="w-6 h-6 text-green-500" />
            : <ShieldOff className="w-6 h-6 text-slate-400" />}
        </div>
        <div>
          <h2 className="font-bold text-slate-900 text-lg">Autentikasi Dua Faktor (2FA)</h2>
          <p className="text-sm text-slate-500">
            {is2FAEnabled
              ? "2FA aktif — akunmu terlindungi dengan lapisan keamanan ekstra."
              : "Tambahkan lapisan keamanan ekstra menggunakan Google Authenticator."}
          </p>
          {hasCredentialAccount !== null && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {isSocialOnly
                ? <><Chrome className="w-3.5 h-3.5 text-slate-400" /><span className="text-[11px] text-slate-400">Login via Google</span></>
                : <><Lock className="w-3.5 h-3.5 text-slate-400" /><span className="text-[11px] text-slate-400">Login via Email & Password</span></>}
            </div>
          )}
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${is2FAEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
          {is2FAEnabled ? "Aktif" : "Nonaktif"}
        </span>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── 2FA Belum Aktif ──────────────────────────────────────────────── */}
        {!is2FAEnabled && (
          <>
            {/* IDLE */}
            {setupStep === "idle" && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm font-bold text-blue-800 mb-2">Cara kerja 2FA:</p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Install <strong>Google Authenticator</strong> atau <strong>Authy</strong> di HP</li>
                    <li>Scan QR code yang akan kami tampilkan</li>
                    <li>Masukkan kode 6 digit untuk verifikasi</li>
                    <li>Setiap login, gunakan kode dari aplikasi</li>
                  </ol>
                </div>

                {isSocialOnly && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <Chrome className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Akun Google Terdeteksi</p>
                      <p className="text-xs text-amber-700 mt-0.5">Tidak perlu memasukkan password. Klik tombol di bawah untuk langsung mulai.</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setError(null);
                    isSocialOnly ? handleGetQrSocial() : setSetupStep("confirm-password");
                  }}
                  disabled={isLoading || hasCredentialAccount === null}
                  className="w-full h-12 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ShieldCheck className="w-5 h-5" />Aktifkan 2FA Sekarang</>}
                </button>
              </div>
            )}

            {/* STEP: Konfirmasi Password (email/password accounts only) */}
            {setupStep === "confirm-password" && (
              <form onSubmit={handleGetQrWithPassword} className="space-y-4">
                <p className="text-sm text-slate-600">Masukkan password untuk memulai setup 2FA.</p>
                <div className="group">
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block group-focus-within:text-[#FF6B4A]">Password Saat Ini</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password kamu"
                      className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-11 outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-sm"
                      required autoFocus
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setSetupStep("idle"); setError(null); }} className="flex-1 h-11 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm">Batal</button>
                  <button type="submit" disabled={isLoading || !password} className="flex-1 h-11 bg-[#FF6B4A] text-white rounded-xl font-bold hover:bg-[#fa5a35] transition-all text-sm disabled:opacity-50 flex items-center justify-center">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Tampilkan QR Code"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP: Scan QR + Masukkan Kode (1 halaman) */}
            {setupStep === "scan-and-verify" && (
              <form onSubmit={handleVerifyAndEnable} className="space-y-5">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-slate-600 text-center">
                    Scan QR ini dengan <strong>Google Authenticator</strong> atau <strong>Authy</strong>, lalu masukkan kode 6 digit di bawah.
                  </p>
                  {qrCodeDataUrl && (
                    <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                      <Image src={qrCodeDataUrl} alt="QR Code 2FA" width={180} height={180} />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-100" />
                  <p className="relative text-center text-[11px] font-bold text-slate-400 bg-white px-3 w-fit mx-auto">
                    Setelah scan, masukkan kode yang muncul
                  </p>
                </div>

                {/* Input Kode */}
                <div className="group">
                  <label className="text-xs font-bold text-slate-700 mb-1.5 block group-focus-within:text-[#FF6B4A]">
                    Kode dari Authenticator
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl px-4 outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all text-center text-3xl font-bold font-mono tracking-[0.4em]"
                    maxLength={6}
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-center">Kode berubah setiap 30 detik — masukkan yang aktif saat ini</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setSetupStep("idle"); setError(null); setVerifyCode(""); }}
                    className="flex-1 h-11 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || verifyCode.length !== 6}
                    className="flex-1 h-11 bg-[#FF6B4A] text-white rounded-xl font-bold hover:bg-[#fa5a35] transition-all text-sm disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : "Aktifkan 2FA ✓"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP: Backup Codes */}
            {setupStep === "show-backup" && (
              <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm font-bold text-amber-800 mb-1">⚠️ Simpan Backup Codes Ini!</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Digunakan jika kamu kehilangan akses ke Authenticator. Setiap kode hanya bisa dipakai <strong>sekali</strong>.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((bc, i) => (
                    <button key={i} onClick={() => copyCode(bc, i)} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 group transition-all">
                      <span className="font-mono text-xs text-slate-700">{bc}</span>
                      {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />}
                    </button>
                  ))}
                </div>
                <button onClick={copyAllCodes} className="w-full h-10 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  {allCopied ? <><Check className="w-4 h-4 text-green-500" />Tersalin!</> : <><Copy className="w-4 h-4" />Salin Semua</>}
                </button>
                <button onClick={() => window.location.reload()} className="w-full h-12 bg-[#FF6B4A] text-white rounded-xl font-bold hover:bg-[#fa5a35] transition-all shadow-lg shadow-orange-100">
                  Selesai — 2FA Aktif! ✅
                </button>
              </div>
            )}
          </>
        )}

        {/* ── 2FA Sudah Aktif ──────────────────────────────────────────────── */}
        {is2FAEnabled && (
          <>
            {disableStep === "idle" && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Akunmu Terlindungi</p>
                    <p className="text-xs text-green-700 mt-1">Setiap login memerlukan kode dari Authenticator.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setDisableStep("confirm-disable"); setError(null); }}
                  className="w-full h-11 border-2 border-red-200 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <ShieldOff className="w-4 h-4" />Nonaktifkan 2FA
                </button>
              </div>
            )}

            {disableStep === "confirm-disable" && (
              <form onSubmit={handleDisable} className="space-y-4">
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-sm font-bold text-red-700 mb-1">⚠️ Yakin ingin menonaktifkan 2FA?</p>
                  <p className="text-xs text-red-600">
                    {isSocialOnly ? "Akun Google — tidak perlu memasukkan password." : "Masukkan password untuk konfirmasi."}
                  </p>
                </div>

                {!isSocialOnly && (
                  <div className="group">
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">Password Saat Ini</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showDisablePassword ? "text" : "password"}
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Masukkan password"
                        className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-11 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all text-sm"
                        required
                      />
                      <button type="button" onClick={() => setShowDisablePassword(!showDisablePassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {isSocialOnly && (
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
                    <Chrome className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-500">Akun Google — tidak perlu password</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => { setDisableStep("idle"); setError(null); }} className="flex-1 h-11 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm">Batal</button>
                  <button type="submit" disabled={isLoading || (!isSocialOnly && !disablePassword)} className="flex-1 h-11 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all text-sm disabled:opacity-50 flex items-center justify-center">
                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Nonaktifkan"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettings;
