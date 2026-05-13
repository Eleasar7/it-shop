"use client";

// app/(admin)/admin/orders/[id]/OrderStatusUpdater.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

const ORDER_STATUSES = [
  { value: "PENDING",    label: "Ausstehend" },
  { value: "CONFIRMED",  label: "Bestätigt" },
  { value: "PROCESSING", label: "In Bearbeitung" },
  { value: "SHIPPED",    label: "Versendet" },
  { value: "DELIVERED",  label: "Geliefert" },
  { value: "CANCELLED",  label: "Storniert" },
  { value: "REFUNDED",   label: "Erstattet" },
];

const PAYMENT_STATUSES = [
  { value: "PENDING",   label: "Ausstehend" },
  { value: "PAID",      label: "Bezahlt" },
  { value: "FAILED",    label: "Fehlgeschlagen" },
  { value: "REFUNDED",  label: "Erstattet" },
];

interface Props {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus, currentPaymentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [paymentStatus, setPaymentStatus] = useState(currentPaymentStatus);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const changed = status !== currentStatus || paymentStatus !== currentPaymentStatus;

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-slate-200 text-sm">Status verwalten</h3>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Bestellstatus</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input text-sm"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Zahlungsstatus</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="input text-sm"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSave}
        disabled={loading || !changed}
        className={`btn-primary w-full py-2.5 text-sm transition-all ${
          saved ? "bg-green-600 hover:bg-green-600" : ""
        }`}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : saved ? (
          "✓ Gespeichert"
        ) : (
          <><Save size={14} /> Speichern</>
        )}
      </button>
    </div>
  );
}
