"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Config ────────────────────────────────────────────────────────────────────
const TOAST_CONFIG: Record<ToastType, { icon: React.ReactNode; classes: string; progressClass: string }> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    classes: "bg-white border border-green-100 text-slate-800",
    progressClass: "bg-green-500",
  },
  error: {
    icon: <XCircle className="w-5 h-5 shrink-0" />,
    classes: "bg-white border border-red-100 text-slate-800",
    progressClass: "bg-red-500",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 shrink-0" />,
    classes: "bg-white border border-amber-100 text-slate-800",
    progressClass: "bg-amber-500",
  },
  info: {
    icon: <Info className="w-5 h-5 shrink-0" />,
    classes: "bg-white border border-blue-100 text-slate-800",
    progressClass: "bg-blue-500",
  },
};

const ICON_COLOR: Record<ToastType, string> = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

// ── Single Toast ──────────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const duration = toast.duration ?? 4000;
  const config = TOAST_CONFIG[toast.type];

  useEffect(() => {
    // Trigger mount animation
    const mountTimer = requestAnimationFrame(() => setVisible(true));

    // Progress bar countdown
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - (100 / (duration / 100));
        return next <= 0 ? 0 : next;
      });
    }, 100);

    // Auto dismiss
    const dismissTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => {
      cancelAnimationFrame(mountTimer);
      clearInterval(interval);
      clearTimeout(dismissTimer);
    };
  }, [toast.id, duration, onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 w-full max-w-sm rounded-2xl px-4 py-4 shadow-xl shadow-slate-200/80
        transition-all duration-300 ease-out overflow-hidden
        ${config.classes}
        ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}
      `}
    >
      {/* Colored left border accent */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${config.progressClass}`} />

      {/* Icon */}
      <span className={`mt-0.5 ${ICON_COLOR[toast.type]}`}>{config.icon}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 leading-snug">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">{toast.description}</p>
        )}
      </div>

      {/* Close */}
      <button
        onClick={handleDismiss}
        className="shrink-0 mt-0.5 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100">
        <div
          className={`h-full ${config.progressClass} transition-all ease-linear`}
          style={{ width: `${progress}%`, transitionDuration: "100ms" }}
        />
      </div>
    </div>
  );
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // max 5 toasts
  }, []);

  const contextValue: ToastContextValue = {
    toast: addToast,
    success: (title, description) => addToast({ type: "success", title, description }),
    error: (title, description) => addToast({ type: "error", title, description }),
    warning: (title, description) => addToast({ type: "warning", title, description }),
    info: (title, description) => addToast({ type: "info", title, description }),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Portal — fixed bottom-right */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
