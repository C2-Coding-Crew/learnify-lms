"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client"; 
import QRCodeLib from "qrcode";
import { ShieldPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Setup2FAPage() {
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const generateQR = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      // ✅ PERBAIKAN UTAMA:
      // Kita cast ke 'as any' dan kirim password: "" secara eksplisit.
      // Ini untuk memenuhi validasi schema server (expected string) 
      // sekaligus bypass pengecekan password asli karena disablePasswordValidation sudah true.
      const { data, error } = await (authClient.twoFactor as any).enable({
        password: "" 
      });

      if (error) {
        console.error("ERROR NYATA:", error);
        
        // Handle jika masih ada kendala validasi
        if (error.code === "VALIDATION_ERROR" || error.status === 400) {
            setErrorMsg("Masalah validasi server. Pastikan server sudah di-restart.");
        } else {
            setErrorMsg(error.message || "Gagal generate 2FA");
        }
        return;
      }

      if (data?.totpURI) {
        const qrDataUrl = await QRCodeLib.toDataURL(data.totpURI, {
          width: 250,
          margin: 2,
        });
        setQrCodeImage(qrDataUrl);
      }
    } catch (err) {
      console.error("QR ERROR:", err);
      setErrorMsg("Terjadi error sistem saat membuat QR Code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length < 6) return;

    setIsVerifying(true);
    try {
      const { data, error } = await (authClient.twoFactor as any).verifyOtp({
        code: otpCode,
      });

      if (error) {
        alert(error.message || "Kode OTP salah!");
      } else {
        alert("2FA Berhasil diaktifkan! Akun kamu sekarang aman.");
        router.push("/dashboard/admin");
        router.refresh();
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-orange-50 text-center">
        
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600">
          <ShieldPlus size={32} />
        </div>

        <h2 className="text-2xl font-black mb-2 tracking-tight text-slate-800">Setup Security</h2>
        <p className="text-slate-400 text-sm font-bold mb-8 leading-relaxed">
          Klik tombol di bawah untuk mendapatkan QR Code Google Authenticator.
        </p>

        {!qrCodeImage && (
            <Button
                onClick={generateQR}
                disabled={isLoading}
                className="w-full mb-6 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 font-black text-lg shadow-lg shadow-orange-100 transition-all active:scale-95"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : "Generate QR Code"}
            </Button>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 rounded-2xl text-red-600 text-xs font-bold border border-red-100 italic animate-pulse">
            Error: {errorMsg}
          </div>
        )}

        {qrCodeImage && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="bg-orange-50 p-6 rounded-[2.5rem] inline-block border-2 border-dashed border-orange-200">
              <img src={qrCodeImage} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl shadow-inner" />
            </div>

            <form onSubmit={handleActivate} className="space-y-6 text-left">
              <div className="px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">6-Digit Verification Code</label>
              </div>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000 000"
                maxLength={6}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] py-5 text-center text-3xl font-black tracking-[0.5em] focus:border-orange-500 outline-none transition-all placeholder:text-slate-200 text-slate-700"
              />

              <Button
                type="submit"
                disabled={isVerifying || otpCode.length < 6}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black shadow-xl shadow-orange-200 active:scale-95 transition-transform"
              >
                {isVerifying ? <Loader2 className="animate-spin" /> : "Aktifkan 2FA Sekarang"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}