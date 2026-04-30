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
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  invoiceStatus: string;
  dueDate: string;
  courseName?: string;
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
          setTimeout(() => router.push("/dashboard/student"), 2000);
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

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-[#2D2D2D]">Pembayaran</h1>
            <p className="text-xs text-slate-400 font-medium">Selesaikan pembayaran untuk mengakses kursus</p>
          </div>
        </div>

        {/* Status Banner */}
        {paymentStatus === "success" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-3xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-green-800">Pembayaran Berhasil! 🎉</p>
              <p className="text-sm text-green-600">Kamu sekarang bisa mengakses kursus ini.</p>
            </div>
          </div>
        )}

        {paymentStatus === "failed" && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-3xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <XCircle size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-red-800">Pembayaran Gagal</p>
              <p className="text-sm text-red-600">Silakan coba lagi atau pilih metode pembayaran lain.</p>
            </div>
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-3xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-yellow-800">Menunggu Pembayaran</p>
              <p className="text-sm text-yellow-600">Selesaikan pembayaran sebelum jatuh tempo.</p>
            </div>
          </div>
        )}

        {/* Invoice Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#FF6B4A] to-orange-400 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={20} />
              <span className="text-sm font-bold opacity-80">Invoice Pembayaran</span>
            </div>
            <p className="font-black text-2xl">{formatIDR(Number(invoice.totalAmount))}</p>
            <p className="text-white/70 text-xs mt-1">{invoice.invoiceNumber}</p>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Status Invoice</span>
              <span className={`font-black capitalize ${
                invoice.invoiceStatus === "paid" ? "text-green-600" :
                invoice.invoiceStatus === "pending" ? "text-orange-500" :
                "text-red-500"
              }`}>
                {invoice.invoiceStatus === "paid" ? "✓ Lunas" :
                 invoice.invoiceStatus === "pending" ? "⏳ Belum Dibayar" : "✗ Dibatalkan"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Total Bayar</span>
              <span className="font-black text-[#2D2D2D]">{formatIDR(Number(invoice.totalAmount))}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Jatuh Tempo</span>
              <span className="font-bold text-slate-700 text-right text-xs max-w-[180px]">
                {formatDate(invoice.dueDate)}
              </span>
            </div>

            <div className="border-t border-slate-50 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                <ShieldCheck size={14} className="text-green-500" />
                <span>Pembayaran aman & terenkripsi via Midtrans</span>
              </div>

              {invoice.invoiceStatus !== "paid" && paymentStatus !== "success" ? (
                <button
                  onClick={handlePay}
                  disabled={isLoading || !clientKey}
                  className="w-full h-14 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white font-black rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-orange-200/50"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={20} />
                      Bayar Sekarang — {formatIDR(Number(invoice.totalAmount))}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => router.push("/dashboard/student")}
                  className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Menuju Dashboard
                </button>
              )}

              {!clientKey && (
                <p className="text-center text-xs text-red-500 mt-3">
                  ⚠️ Midtrans Client Key belum dikonfigurasi di environment
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4">
            <p className="text-[11px] text-slate-400 text-center font-medium">
              Didukung berbagai metode: Transfer Bank, QRIS, GoPay, OVO, dll.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
