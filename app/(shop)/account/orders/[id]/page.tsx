// app/(shop)/account/orders/[id]/page.tsx

import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Package, CreditCard, CheckCircle, Truck, MapPin } from "lucide-react";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Bestelldetails | Envetra" };

const STATUS_STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING:    "Ausstehend",
  CONFIRMED:  "Bestätigt",
  PROCESSING: "In Bearbeitung",
  SHIPPED:    "Versendet",
  DELIVERED:  "Geliefert",
  CANCELLED:  "Storniert",
  REFUNDED:   "Erstattet",
};
const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-warning", CONFIRMED: "badge-info", PROCESSING: "badge-info",
  SHIPPED: "badge-info", DELIVERED: "badge-success", CANCELLED: "badge-danger", REFUNDED: "badge-neutral",
};

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user    = await requireAuth();

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id }, // ← security: user can only see their own orders
    include: {
      items: {
        select: {
          id: true, productName: true, productSku: true,
          imageUrl: true, unitPrice: true, quantity: true, totalPrice: true,
        },
      },
    },
  });
  if (!order) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const currentStep  = STATUS_STEPS.indexOf(order.status);
  const isCancelled  = order.status === "CANCELLED" || order.status === "REFUNDED";
  const snap         = order.shippingSnapshot as any | null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <Link href="/account/orders"
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ChevronLeft size={15} /> Zurück zu meinen Bestellungen
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono">
            #{order.orderNumber.slice(-8).toUpperCase()}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date(order.createdAt).toLocaleDateString("de-DE", {
              day: "2-digit", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${STATUS_BADGE[order.status] ?? "badge-neutral"}`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <span className={`badge ${order.paymentStatus === "PAID" ? "badge-success" : "badge-warning"}`}>
            {order.paymentStatus === "PAID" ? "✓ Bezahlt" : "Ausstehend"}
          </span>
        </div>
      </div>

      {/* Progress stepper */}
      {!isCancelled && (
        <div className="card p-5">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center gap-1.5 ${idx <= currentStep ? "text-indigo-400" : "text-slate-600"}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    idx < currentStep  ? "bg-indigo-600 border-indigo-600 text-white" :
                    idx === currentStep ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" :
                    "border-slate-700 text-slate-600"
                  }`}>
                    {idx < currentStep ? <CheckCircle size={12} /> : idx + 1}
                  </div>
                  <span className="text-[10px] whitespace-nowrap hidden sm:block">
                    {STATUS_LABELS[step]}
                  </span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${idx < currentStep ? "bg-indigo-600" : "bg-slate-700"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking info */}
      {order.trackingNumber && (
        <div className="card p-5 space-y-3"
          style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <div className="flex items-center gap-2">
            <Truck size={15} className="text-indigo-400" />
            <h2 className="font-semibold text-slate-200 text-sm">Sendungsverfolgung</h2>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              {order.shippingProvider && (
                <p className="text-xs text-slate-500 mb-0.5">{order.shippingProvider}</p>
              )}
              <p className="font-mono text-sm font-bold text-indigo-300">{order.trackingNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-2">
          <Package size={14} className="text-indigo-400" />
          <h2 className="font-semibold text-slate-200 text-sm">Artikel ({order.items.length})</h2>
        </div>
        <div className="divide-y divide-slate-700/30">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 relative border border-slate-700/40">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.productName} fill className="object-contain p-1" sizes="48px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={16} className="text-slate-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{item.productName}</p>
                {item.productSku && <p className="text-xs text-slate-500 mt-0.5">SKU: {item.productSku}</p>}
                <p className="text-xs text-slate-500 mt-0.5">{item.quantity} × {fmt(Number(item.unitPrice))}</p>
              </div>
              <p className="text-sm font-semibold text-slate-100 flex-shrink-0 tabular-nums">
                {fmt(Number(item.totalPrice))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="card p-5 space-y-2.5">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={14} className="text-indigo-400" />
          <h2 className="font-semibold text-slate-200 text-sm">Zusammenfassung</h2>
        </div>
        {[
          { label: "Zwischensumme", value: fmt(Number(order.subtotal)) },
          { label: "Versand",       value: fmt(Number(order.shippingCost)) },
          { label: "MwSt. (19%)",   value: fmt(Number(order.taxAmount)) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm text-slate-400">
            <span>{label}</span>
            <span className="text-slate-300 tabular-nums">{value}</span>
          </div>
        ))}
        <div className="pt-3 border-t border-slate-700/50 flex justify-between font-bold">
          <span className="text-slate-100">Gesamt</span>
          <span className="text-slate-100 tabular-nums">{fmt(Number(order.totalAmount))}</span>
        </div>
      </div>

      {/* Shipping address */}
      {snap && (
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-indigo-400" />
            <h2 className="font-semibold text-slate-200 text-sm">Lieferadresse</h2>
          </div>
          <div className="text-sm text-slate-400 space-y-1">
            <p className="text-slate-200">{snap.name}</p>
            {snap.address && (
              <>
                <p>{snap.address.line1}</p>
                {snap.address.line2 && <p>{snap.address.line2}</p>}
                <p>{snap.address.postal_code} {snap.address.city}</p>
                <p>{snap.address.country}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
