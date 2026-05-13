"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  X,
  Loader2,
  Fingerprint
} from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: QR, 2: Verification

  const handleEnable2FA = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setQrCode(data.qrCode);
      setTotpSecret(data.secret);
      setShow2FAModal(true);
      setStep(1);
    } catch (err: any) {
      toast.error("Gagal memulai setup 2FA", "Coba lagi nanti.");
    } finally {
      setIsProcessing(false);
    }
  };

  const verify2FA = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast.error("Format Kode Salah", "Masukkan 6 digit kode OTP.");
      return;
    }
    
    setIsProcessing(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode, secret: totpSecret }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("2FA Berhasil Diaktifkan", "Akun Anda sekarang lebih aman.");
        setShow2FAModal(false);
      } else {
        toast.error("Verifikasi Gagal", "Kode OTP tidak valid.");
      }
    } catch (err: any) {
      toast.error("Terjadi Kesalahan", "Gagal memverifikasi kode.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Banner (Optional for Admin) */}
      <div className="bg-[#FF6B4A]/5 px-8 py-2 border-b border-orange-100 flex items-center justify-between">
        <p className="text-[10px] font-black text-[#FF6B4A] uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck size={12} /> Super Admin Control Panel
        </p>
        <button 
          onClick={handleEnable2FA}
          className="text-[9px] font-black bg-white border border-orange-200 text-[#FF6B4A] px-3 py-1 rounded-lg hover:bg-[#FF6B4A] hover:text-white transition-all flex items-center gap-1 shadow-sm"
        >
          <Key size={10} /> SECURITY SETUP
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8F9FB]">
        {children}
      </div>

      {/* 2FA Setup Modal Premium */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[500px] rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 relative group">
            {/* Background Decorative */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl -mr-24 -mt-24" />
            
            <button 
              onClick={() => setShow2FAModal(false)}
              className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors bg-slate-50 w-10 h-10 rounded-2xl flex items-center justify-center z-10"
            >
              <X size={18} />
            </button>

            <div className="p-10 relative">
              {/* Step Indicator */}
              <div className="flex items-center gap-3 mb-10">
                <div className={`w-12 h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#FF6B4A]' : 'bg-slate-100'}`} />
                <div className={`w-12 h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#FF6B4A]' : 'bg-slate-100'}`} />
              </div>

              <div className="mb-10">
                <div className="w-16 h-16 bg-orange-50 text-[#FF6B4A] rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Fingerprint size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {step === 1 ? "Amankan Akun Anda" : "Verifikasi OTP"}
                </h2>
                <p className="text-slate-400 font-medium text-[15px] mt-2 leading-relaxed">
                  {step === 1 
                    ? "Gunakan aplikasi Google Authenticator atau Authy untuk memindai kode QR di bawah ini." 
                    : "Masukkan 6 digit kode yang muncul di aplikasi authenticator Anda untuk konfirmasi."}
                </p>
              </div>

              {step === 1 ? (
                <div className="space-y-10 flex flex-col items-center">
                  <div className="p-6 bg-white border-2 border-dashed border-orange-100 rounded-[2.5rem] shadow-inner relative group-hover:rotate-1 transition-transform duration-500">
                    {qrCode ? (
                      <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mix-blend-multiply" />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center"><Loader2 className="animate-spin text-orange-200" /></div>
                    )}
                  </div>
                  
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 text-slate-400 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <Lock size={16} className="text-orange-300" />
                      <span className="text-xs font-bold font-mono truncate flex-1">{totpSecret}</span>
                      <button className="text-[#FF6B4A] text-[10px] font-black uppercase">Copy</button>
                    </div>
                    <Button 
                      onClick={() => setStep(2)}
                      className="w-full bg-[#FF6B4A] hover:bg-[#E55A3B] text-white h-16 rounded-[2rem] font-black text-lg shadow-xl shadow-orange-100 group/btn transition-all"
                    >
                      Lanjut Verifikasi <RefreshCw size={18} className="ml-2 group-hover:rotate-180 transition-transform duration-700" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authentication Code</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value)}
                      placeholder="· · · · · ·"
                      className="w-full h-24 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center text-5xl font-black tracking-[0.5em] text-[#FF6B4A] outline-none focus:ring-8 focus:ring-orange-50 focus:bg-white transition-all shadow-inner placeholder:text-slate-200"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setStep(1)}
                      className="flex-1 h-16 rounded-[1.5rem] font-black text-slate-400"
                    >
                      Kembali
                    </Button>
                    <Button 
                      onClick={verify2FA}
                      disabled={isProcessing}
                      className="flex-[2] bg-[#FF6B4A] hover:bg-[#E55A3B] text-white h-16 rounded-[2rem] font-black shadow-xl shadow-orange-100"
                    >
                      {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                      Verifikasi & Selesai
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
