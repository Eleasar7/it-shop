"use client";

// app/(admin)/admin/orders/[id]/OrderStatusForm.tsx

import { useActionState, useEffect, useState } from "react";
import { Save, CheckCircle2, AlertCircle, Loader2, Truck } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/orders";

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
  { value: "PENDING",            label: "Ausstehend" },
  { value: "PAID",               label: "Bezahlt" },
  { value: "FAILED",             label: "Fehlgeschlagen" },
  { value: "REFUNDED",           label: "Erstattet" },
  { value: "PARTIALLY_REFUNDED", label: "Teilweise erstattet" },
];

const SHIPPING_PROVIDERS = ["DHL", "DPD", "UPS", "FedEx", "GLS", "Hermes", "Amazon Logistics"];

interface Props {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
  currentAdminNotes: string;
  currentTrackingNumber?: string;
  currentShippingProvider?: string;
}

export function OrderStatusForm({
  orderId,
  currentStatus, currentPaymentStatus, currentAdminNotes,
  currentTrackingNumber = "", currentShippingProvider = "",
}: Props) {
  const boundAction = updateOrderStatus.bind(null, orderId);
  const [state, formAction, isPending] = useActionState(boundAction, {});

  const [status,           setStatus]           = useState(currentStatus);
  const [paymentStatus,    setPaymentStatus]    = useState(currentPaymentStatus);
  const [adminNotes,       setAdminNotes]       = useState(currentAdminNotes);
  const [trackingNumber,   setTrackingNumber]   = useState(currentTrackingNumber);
  const [shippingProvider, setShippingProvider] = useState(currentShippingProvider);
  const [showTracking,     setShowTracking]     = useState(!!currentTrackingNumber);

  useEffect(() => { setStatus(currentStatus); },           [currentStatus]);
  useEffect(() => { setPaymentStatus(currentPaymentStatus); }, [currentPaymentStatus]);
  useEffect(() => { setAdminNotes(currentAdminNotes); },   [currentAdminNotes]);
  useEffect(() => { setTrackingNumber(currentTrackingNumber); }, [currentTrackingNumber]);
  useEffect(() => { setShippingProvider(currentShippingProvider); }, [currentShippingProvider]);

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-slate-200 text-sm">Status verwalten</h3>

      {state.success && (
        <div className="flex items-center gap-2 text-green-400 text-xs p-2.5 rounded-lg bg-green-950/30 border border-green-500/20 animate-fade-in">
          <CheckCircle2 size={13} /> Gespeichert
        </div>
      )}
      {state.error && (
        <div className="flex items-center gap-2 text-red-400 text-xs p-2.5 rounded-lg bg-red-950/30 border border-red-500/20">
          <AlertCircle size={13} /> {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-3">
        {/* Controlled hidden inputs */}
        <input type="hidden" name="status"           value={status} />
        <input type="hidden" name="paymentStatus"    value={paymentStatus} />
        <input type="hidden" name="trackingNumber"   value={trackingNumber} />
        <input type="hidden" name="shippingProvider" value={shippingProvider} />

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Bestellstatus</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input text-sm">
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Zahlungsstatus</label>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="input text-sm">
            {PAYMENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Tracking section */}
        <div>
          <button
            type="button"
            onClick={() => setShowTracking(!showTracking)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Truck size={12} />
            {showTracking ? "Tracking ausblenden" : "Tracking hinzufügen"}
          </button>

          {showTracking && (
            <div className="mt-2.5 space-y-2">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Versanddienstleister</label>
                <select
                  value={shippingProvider}
                  onChange={(e) => setShippingProvider(e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Auswählen…</option>
                  {SHIPPING_PROVIDERS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">Tracking-Nummer</label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="z.B. 1Z999AA10123456784"
                  className="input text-sm font-mono"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Interne Notiz</label>
          <textarea
            name="adminNotes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
            className="input text-sm resize-none"
            placeholder="Nur für Admins sichtbar…"
          />
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5 text-sm">
          {isPending ? (
            <><Loader2 size={14} className="animate-spin" /> Wird gespeichert…</>
          ) : (
            <><Save size={14} /> Speichern</>
          )}
        </button>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => { setStatus("PROCESSING"); }}
            className="btn-secondary text-xs py-2 justify-center"
          >
            → In Bearbeitung
          </button>
          <button
            type="button"
            onClick={() => { setStatus("DELIVERED"); }}
            className="btn-secondary text-xs py-2 justify-center"
          >
            → Geliefert
          </button>
        </div>
      </form>
    </div>
  );
}
