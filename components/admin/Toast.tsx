"use client";

// components/admin/Toast.tsx
// Lightweight toast notification system for the admin area.
// Usage: useToast() hook returns { toast } – call toast({ message, type })

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (opts: { message: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback(({ message, type = "success" }: { message: string; type?: ToastType }) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {items.map((item) => (
          <ToastItem
            key={item.id}
            item={item}
            onDismiss={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const configs = {
    success: {
      bg: "bg-slate-900 border-green-500/40",
      icon: CheckCircle2,
      iconClass: "text-green-400",
    },
    error: {
      bg: "bg-slate-900 border-red-500/40",
      icon: AlertCircle,
      iconClass: "text-red-400",
    },
    info: {
      bg: "bg-slate-900 border-indigo-500/40",
      icon: Info,
      iconClass: "text-indigo-400",
    },
  };

  const { bg, icon: Icon, iconClass } = configs[item.type];

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl shadow-black/40 animate-slide-up ${bg}`}
    >
      <Icon size={16} className={`flex-shrink-0 ${iconClass}`} />
      <p className="text-sm text-slate-200 flex-1">{item.message}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
