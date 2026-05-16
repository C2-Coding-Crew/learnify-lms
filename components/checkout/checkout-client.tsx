"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Lock,
  Tag,
  PlayCircle
} from "lucide-react";
import { toast } from "sonner";

interface CourseInfo {
  title: string;
  slug?: string;
  thumbnail?: string | null;
  level: string;
  price: number;
  categoryName?: string;
  instructorName?: string;
  instructorImage?: string | null;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  discountAmt?: number;
  invoiceStatus: string;
  dueDate: string;
  course?: CourseInfo;
}

interface Props {
  invoice: Invoice;
}

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export default function CheckoutClient({ invoice }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">(
    invoice.invoiceStatus === "paid" ? "success" : "idle"
  );

  // Inject Midtrans Snap.js script
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

  useEffect(() => {
    if (!clientKey) return;
    const scriptId = "midtrans-snap";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [clientKey, isProduction]);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handlePay = async () => {
    setIsLoading(true);
    try {
      // 1. Dapatkan Snap token dari server
      const res = await fetch("/api/payment/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNumber: invoice.invoiceNumber }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Gagal membuat token pembayaran");
      }

      const { snapToken } = await res.json();

      // 2. Buka Midtrans Snap popup
      if (!window.snap) {
        throw new Error("Midtrans Snap.js belum dimuat. Coba refresh halaman.");
      }

      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          console.log("[Midtrans] Payment success:", result);
          setPaymentStatus("success");
          toast.success("🎉 Pembayaran berhasil! Kamu sekarang bisa mulai belajar.");
        },
        onPending: (result) => {
          console.log("[Midtrans] Payment pending:", result);
          setPaymentStatus("pending");
          toast.info("⏳ Pembayaran sedang diproses. Kamu akan mendapat konfirmasi via email.");
        },
        onError: (result) => {
          console.error("[Midtrans] Payment error:", result);
          setPaymentStatus("failed");
          toast.error("❌ Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: () => {
          toast.info("Popup ditutup. Kamu bisa membayar kapan saja sebelum jatuh tempo.");
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const course = invoice.course;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-green-500 w-5 h-5" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Secure Checkout
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 md:px-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* ── Left Column: Order Summary ── */}
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight mb-2">
                Ringkasan Pesanan
              </h1>
              <p className="text-slate-500 font-medium">
                Periksa kembali detail kursus yang akan kamu beli.
              </p>
            </div>

            {course ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Course Thumbnail */}
                  <div className="w-full sm:w-48 h-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0 relative group">
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300">
                        <GraduationCap size={40} />
                      </div>
                    )}
                  </div>
                  
                  {/* Course Info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                        {course.categoryName || "Kursus"}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-[#0F172A] leading-tight mb-3">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                        <img 
                          src={course.instructorImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructorName}`} 
                          alt="Instructor" 
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-600">
                        Oleh {course.instructorName || "Instruktur Learnify"}
                      </span>
                    </div>
                  </div>
                </div>

                <hr className="my-6 border-slate-100" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-slate-500">
                    <span className="font-medium text-sm">Harga Normal</span>
                    <span className="font-bold">{formatIDR(course.price)}</span>
                  </div>
                  {(invoice.discountAmt ?? 0) > 0 && (
                    <div className="flex justify-between items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <span className="font-bold text-sm flex items-center gap-1.5">
                        <Tag size={14} /> Diskon Kupon
                      </span>
                      <span className="font-black">-{formatIDR(invoice.discountAmt!)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="font-black text-slate-800 text-lg">Total Tagihan</span>
                    <span className="font-black text-2xl text-[#FF6B4A]">
                      {formatIDR(invoice.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center">
                <p className="text-slate-500">Detail kursus tidak tersedia.</p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                <Lock className="text-slate-400 w-8 h-8" />
                <div>
                  <p className="font-bold text-slate-700 text-xs">Pembayaran Aman</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enkripsi 256-bit SSL</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100">
                <Sparkles className="text-amber-500 w-8 h-8" />
                <div>
                  <p className="font-bold text-slate-700 text-xs">Akses Selamanya</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Termasuk pembaruan</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Payment Gateway ── */}
          <div className="w-full lg:w-[420px]">
            {/* Status Banners */}
            {paymentStatus === "success" && (
              <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 shadow-lg shadow-green-200 text-white transform transition-all hover:scale-[1.02]">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <CheckCircle size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="font-black text-lg">Lunas! 🎉</p>
                    <p className="text-green-100 text-xs font-medium">Terima kasih atas pembelian Anda.</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(course?.slug ? `/courses/${course.slug}/learn` : "/dashboard/student")}
                  className="w-full py-3 bg-white text-green-700 hover:bg-green-50 rounded-xl font-black text-sm transition-colors mt-2 flex items-center justify-center gap-2"
                >
                  <PlayCircle size={18} /> Mulai Belajar Sekarang
                </button>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shrink-0">
                  <XCircle size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-red-800">Pembayaran Gagal</p>
                  <p className="text-xs text-red-600 mt-0.5">Silakan coba lagi dengan metode lain.</p>
                </div>
              </div>
            )}

            {paymentStatus === "pending" && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-black text-amber-800">Menunggu Pembayaran</p>
                  <p className="text-xs text-amber-600 mt-0.5">Selesaikan sebelum batas waktu habis.</p>
                </div>
              </div>
            )}

            {/* Invoice Payment Card */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden sticky top-24">
              <div className="bg-[#100E2E] p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Total Pembayaran</p>
                  <p className="font-black text-4xl mb-1">{formatIDR(invoice.totalAmount)}</p>
                  <p className="text-slate-500 text-xs font-medium">No. Invoice: {invoice.invoiceNumber}</p>
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#FF6B4A]/20 rounded-full blur-xl" />
              </div>

              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Status</p>
                    <p className={`text-sm font-black capitalize ${
                      invoice.invoiceStatus === "paid" ? "text-green-600" :
                      invoice.invoiceStatus === "pending" ? "text-orange-500" : "text-red-500"
                    }`}>
                      {invoice.invoiceStatus === "paid" ? "✓ LUNAS" : invoice.invoiceStatus === "pending" ? "⏳ PENDING" : "✗ DIBATALKAN"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Batas Pembayaran</p>
                    <p className="text-sm font-bold text-slate-700">{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>

                {invoice.invoiceStatus !== "paid" && paymentStatus !== "success" ? (
                  <button
                    onClick={handlePay}
                    disabled={isLoading || !clientKey}
                    className="w-full h-14 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white font-black rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200/50"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <CreditCard size={20} />
                        Bayar via Midtrans
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/dashboard/student/purchases")}
                    className="w-full h-14 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    Lihat Riwayat Pembelian
                  </button>
                )}

                {!clientKey && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-center text-[10px] font-bold text-red-600">
                      ⚠️ Midtrans Client Key belum dikonfigurasi di environment (.env).
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
