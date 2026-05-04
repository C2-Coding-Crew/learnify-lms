"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { approveCourse, rejectCourse } from "@/app/dashboard/admin/actions";

// ── Toast ─────────────────────────────────────────────────────────────────────
interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-bold animate-fade-in ${
            t.type === "success"
              ? "bg-green-600 shadow-green-200"
              : "bg-red-500 shadow-red-200"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle size={18} className="shrink-0" />
          ) : (
            <AlertTriangle size={18} className="shrink-0" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-2 opacity-70 hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Reject Modal ──────────────────────────────────────────────────────────────
interface RejectModalProps {
  courseTitle: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function RejectModal({ courseTitle, onConfirm, onCancel, isLoading }: RejectModalProps) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-md mx-4 z-10">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
            <XCircle size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-black text-[#2D2D2D] text-lg leading-tight">
              Tolak Kursus
            </h3>
            <p className="text-slate-400 text-sm mt-1 font-medium leading-relaxed">
              Kursus{" "}
              <span className="font-black text-slate-600">
                &ldquo;{courseTitle}&rdquo;
              </span>{" "}
              akan ditolak dan disembunyikan dari platform.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
            Alasan Penolakan <span className="text-slate-300">(opsional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Contoh: Konten tidak lengkap, video tidak tersedia, materi tidak sesuai standar..."
            rows={4}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-200 resize-none font-medium transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 h-12 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isLoading}
            className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-100"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <XCircle size={16} />
            )}
            Tolak Kursus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ApprovalButtons({
  courseId,
  courseTitle,
}: {
  courseId: number;
  courseTitle: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeAction, setActiveAction] = useState<"approve" | "reject" | null>(null);

  // Auto-dismiss toasts after 4 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const addToast = (type: "success" | "error", message: string) => {
    setToasts((prev) => [...prev, { id: Date.now(), type, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = () => {
    setActiveAction("approve");
    startTransition(async () => {
      try {
        await approveCourse(courseId);
        addToast("success", `✅ Kursus "${courseTitle}" berhasil dipublikasikan!`);
        router.refresh();
      } catch {
        addToast("error", "Gagal menyetujui kursus. Coba lagi.");
      } finally {
        setActiveAction(null);
      }
    });
  };

  // ── Reject ───────────────────────────────────────────────────────────────
  const handleRejectConfirm = (reason: string) => {
    setActiveAction("reject");
    startTransition(async () => {
      try {
        await rejectCourse(courseId);
        setShowRejectModal(false);
        addToast("error", `Kursus "${courseTitle}" telah ditolak.`);
        router.refresh();
      } catch {
        addToast("error", "Gagal menolak kursus. Coba lagi.");
      } finally {
        setActiveAction(null);
      }
    });
  };

  const isApproving = isPending && activeAction === "approve";
  const isRejecting = isPending && activeAction === "reject";

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Approve Button */}
        <button
          onClick={handleApprove}
          disabled={isPending}
          title="Setujui & Publikasikan"
          className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 hover:bg-green-100 rounded-xl font-black text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-green-100 hover:border-green-200 hover:shadow-md hover:shadow-green-50"
        >
          {isApproving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <CheckCircle size={14} />
          )}
          Setujui
        </button>

        {/* Reject Button */}
        <button
          onClick={() => setShowRejectModal(true)}
          disabled={isPending}
          title="Tolak Kursus"
          className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-black text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-red-100 hover:border-red-200 hover:shadow-md hover:shadow-red-50"
        >
          {isRejecting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <XCircle size={14} />
          )}
          Tolak
        </button>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          courseTitle={courseTitle}
          onConfirm={handleRejectConfirm}
          onCancel={() => setShowRejectModal(false)}
          isLoading={isRejecting}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
