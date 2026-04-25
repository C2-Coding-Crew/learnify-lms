"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldOff, Eye, EyeOff, Copy, Check, AlertCircle, Lock, Chrome } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import QRCode from "qrcode";

// ── Flow yang benar sesuai Better Auth: ──────────────────────────────────────
// 1. getTotpUri({ password }) → dapat QR code
// 2. User scan QR di Authenticator
// 3. enable({ password, code }) → verifikasi SEKALIGUS aktifkan 2FA
// ─────────────────────────────────────────────────────────────────────────────

type SetupStep = "idle" | "confirm-password" | "scan-and-verify";
type DisableStep = "idle" | "confirm-disable";

const TwoFactorSettings = () => {
  const { data: session } = useSession();
  const router = useRouter();
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

  // ── Step 1: Enable 2FA → dapat TOTP URI + Backup Codes ──────────────────────
  // enable() membuat secret di DB dan mengembalikan QR code + backup codes
  // 2FA belum aktif sampai user verifikasi kode pertama kali
  const handleGetQrCode = async (pwd: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Untuk social accounts (tanpa credential), tidak perlu password
      // Untuk credential accounts, wajib password
      const enableOptions = isSocialOnly ? {} : { password: pwd };
      
      const { data, error: authError } = await authClient.twoFactor.enable(enableOptions);

      if (authError || !data) {
        setError(authError?.message ?? "Gagal memulai setup 2FA. Coba lagi.");
        return;
      }

      // Simpan backup codes yang dikembalikan
      if (data.backupCodes?.length) {
        setBackupCodes(data.backupCodes);
      }

      const uri = data.totpURI;
      if (!uri) {
        setError("Tidak dapat mendapatkan URI TOTP.");
        return;
      }

      setTotpUri(uri);
      const qr = await QRCode.toDataURL(uri, { width: 240, margin: 2 });
      setQrCodeDataUrl(qr);
      setSetupStep("scan-and-verify");
    } catch (err) {
      console.error("Error enabling 2FA:", err);
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

  // ── Step 2: Verifikasi kode untuk mengaktifkan 2FA ───────────────────────────
  // Setelah user scan QR code dan masukkan kode, verifikasi untuk aktivasi
  const handleVerifyAndEnable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      setError("Masukkan 6 digit kode dari aplikasi Authenticator.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Verifikasi kode TOTP - ini akan mengaktifkan 2FA (set verified=true)
      const { error: verifyError } = await authClient.twoFactor.verifyTotp({
        code: verifyCode,
      });

      if (verifyError) {
        setError(verifyError.message ?? "Kode tidak valid. Silakan coba lagi.");
        return;
      }

      // Berhasil! Reload halaman agar state session ter-update
      window.location.reload();
    } catch (err) {
      console.error("Error verifying 2FA:", err);
      setError("Terjadi kesalahan sistem.");
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

            {/* STEP: QR Code + Backup Codes + Tombol Selesai */}
            {setupStep === "scan-and-verify" && (
              <div className="space-y-5">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-slate-600 text-center">
                    Scan QR ini dengan <strong>Google Authenticator</strong> atau <strong>Authy</strong>.
                  </p>
                  {qrCodeDataUrl && (
                    <div className="p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
                      <Image src={qrCodeDataUrl} alt="QR Code 2FA" width={180} height={180} />
                    </div>
                  )}
                </div>



                {/* Form Verifikasi Kode */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2">
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    Masukkan Kode 6-Digit dari Aplikasi
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Contoh: 123456"
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-center text-lg tracking-[0.5em] font-mono outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all mb-4"
                    required
                  />

                  <button
                    type="button"
                    onClick={handleVerifyAndEnable}
                    disabled={isLoading || verifyCode.length !== 6}
                    className="w-full h-11 bg-[#FF6B4A] text-white rounded-xl font-bold hover:bg-[#fa5a35] transition-all shadow-md shadow-orange-100 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" /> Verifikasi & Aktifkan
                      </>
                    )}
                  </button>
                </div>
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
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full h-11 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all text-sm flex items-center justify-center mt-2"
                >
                  Ke Dashboard
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
