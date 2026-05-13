"use client";

// components/admin/NotificationBell.tsx

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check } from "lucide-react";
import Link from "next/link";
import type { Notification } from "@/types";

const TYPE_ICONS: Record<string, string> = {
  NEW_ORDER:      "🛒",
  LOW_STOCK:      "⚠️",
  NEW_B2B:        "🏢",
  QUOTE_ACCEPTED: "✅",
  QUOTE_REJECTED: "❌",
  NEW_CUSTOMER:   "👤",
  SYSTEM:         "ℹ️",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data ?? []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications([]);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const count = notifications.length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors hover:bg-slate-800/60"
        aria-label={`${count} ungelesene Benachrichtigungen`}
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-black text-white rounded-full px-0.5"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
          style={{ background: "rgb(var(--bg-elevated))", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <span className="font-semibold text-slate-200 text-sm">Benachrichtigungen</span>
            {count > 0 && (
              <button onClick={markAllRead} disabled={loading}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                <Check size={11} /> Alle gelesen
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              Keine neuen Benachrichtigungen
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/30">
              {notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? "📋"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                      {n.link && (
                        <Link href={n.link} onClick={() => setOpen(false)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1 inline-block">
                          Ansehen →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
