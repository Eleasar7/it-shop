// app/(admin)/admin/orders/[id]/page.tsx

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft, Package, User, CreditCard, Truck,
  MapPin, Clock, CheckCircle2, ExternalLink,
} from "lucide-react";
import { OrderStatusForm } from "./OrderStatusForm";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Bestelldetails | Envetra Admin" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Ausstehend", CONFIRMED: "Bestätigt", PROCESSING: "In Bearbeitung",
  SHIPPED: "Versendet", DELIVERED: "Geliefert", CANCELLED: "Storniert", REFUNDED: "Erstattet",
};
const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-warning", CONFIRMED: "badge-info", PROCESSING: "badge-info",
  SHIPPED: "badge-info", DELIVERED: "badge-success", CANCELLED: "badge-danger", REFUNDED: "badge-neutral",
};
const STATUS_STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AdminOrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user:     { select: { id: true, email: true, name: true, company: true, phone: true } },
      items:    true,
      timeline: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!order) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const currentStep  = STATUS_STEPS.indexOf(order.status);
  type ShippingSnap = {
  name?: string;
  address?: {
    line1?: string;
    line2?: string;
    postal_code?: string;
    city?: string;
    country?: string;
  };
};

const snap = order.shippingSnapshot as ShippingSnap | null;
  const customerEmail = order.customerEmail || order.user.email;
  const customerName  = order.customerName  || order.user.name;

  return (
    <div className="space-y-6 pb-8">
      {/* Back */}
      <Link href="/admin/orders"
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ChevronLeft size={15} /> Zurück zu Bestellungen
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-100 font-mono">
            #{order.orderNumber.slice(-8).toUpperCase()}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date(order.createdAt).toLocaleString("de-DE")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className={`badge ${STATUS_BADGE[order.status] ?? "badge-neutral"}`}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          <span className={`badge ${order.paymentStatus === "PAID" ? "badge-success" : "badge-warning"}`}>
            {order.paymentStatus === "PAID" ? "✓ Bezahlt" : order.paymentStatus}
          </span>
        </div>
      </div>

      {/* Progress stepper */}
      {order.status !== "CANCELLED" && order.status !== "REFUNDED" && (
        <div className="card p-5">
          <div className="flex items-center">
            {STATUS_STEPS.map((step, idx) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center gap-1 ${idx <= currentStep ? "text-indigo-400" : "text-slate-600"}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                    idx < currentStep  ? "bg-indigo-600 border-indigo-600 text-white" :
                    idx === currentStep ? "border-indigo-500 text-indigo-400" :
                    "border-slate-700 text-slate-600"
                  }`}>
                    {idx < currentStep ? "✓" : idx + 1}
                  </div>
                  <span className="text-[10px] hidden sm:block whitespace-nowrap">{STATUS_LABELS[step]}</span>
                </div>
                {idx < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${idx < currentStep ? "bg-indigo-600" : "bg-slate-700"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Items + totals */}
        <div className="lg:col-span-2 space-y-4">

          {/* Items */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-2">
              <Package size={14} className="text-indigo-400" />
              <h2 className="font-semibold text-slate-200 text-sm">
                Artikel ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-700/30">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 relative border border-slate-700/40">
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
                    {item.productSku && <p className="text-xs text-slate-500">SKU: {item.productSku}</p>}
                    <p className="text-xs text-slate-500">{item.quantity} × {fmt(Number(item.unitPrice))}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-100 tabular-nums">{fmt(Number(item.totalPrice))}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-700/50 px-5 py-4 space-y-2 bg-slate-800/20">
              {[
                ["Zwischensumme", fmt(Number(order.subtotal))],
                ["Versand",       fmt(Number(order.shippingCost))],
                ["MwSt. (19%)",   fmt(Number(order.taxAmount))],
              ].map(([l, v]) => (
                <div key={l as string} className="flex justify-between text-sm text-slate-400">
                  <span>{l}</span><span className="text-slate-300">{v}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-700/50 flex justify-between font-bold text-base">
                <span className="text-slate-100">Gesamt</span>
                <span className="text-slate-100 tabular-nums">{fmt(Number(order.totalAmount))}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.timeline.length > 0 && (
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-indigo-400" />
                <h2 className="font-semibold text-slate-200 text-sm">Verlauf</h2>
              </div>
              <div className="space-y-3">
                {order.timeline.map((entry, idx) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        idx === 0 ? "bg-indigo-400" : "bg-slate-600"
                      }`} />
                      {idx < order.timeline.length - 1 && (
                        <div className="w-px flex-1 bg-slate-700/50 mt-1" />
                      )}
                    </div>
                    <div className="pb-3 min-w-0">
                      <p className="text-sm text-slate-300">{entry.message}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(entry.createdAt).toLocaleString("de-DE")}
                        {entry.createdBy === "system" ? " · System" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Status updater */}
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentPaymentStatus={order.paymentStatus}
            currentAdminNotes={order.adminNotes ?? ""}
            currentTrackingNumber={order.trackingNumber ?? ""}
            currentShippingProvider={order.shippingProvider ?? ""}
          />

          {/* Customer */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={14} className="text-indigo-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Kunde</h3>
              </div>
              <Link href={`/admin/customers`}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <ExternalLink size={11} />
              </Link>
            </div>
            <div className="space-y-1.5 text-sm">
              <p className="text-slate-200 font-medium">{customerName ?? "–"}</p>
              <p className="text-slate-400">{customerEmail}</p>
              {order.user.company && <p className="text-slate-400">{order.user.company}</p>}
              {order.user.phone   && <p className="text-slate-400">{order.user.phone}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-indigo-400" />
              <h3 className="font-semibold text-slate-200 text-sm">Zahlung</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={`badge ${order.paymentStatus === "PAID" ? "badge-success" : "badge-warning"}`}>
                  {order.paymentStatus === "PAID" ? "Bezahlt" : order.paymentStatus}
                </span>
              </div>
              {order.stripeSessionId && (
                <div>
                  <span className="text-xs text-slate-600 block mb-0.5">Session ID</span>
                  <p className="font-mono text-xs text-slate-600 break-all">{order.stripeSessionId.slice(0, 32)}…</p>
                </div>
              )}
              {order.stripePaymentId && (
                <div>
                  <span className="text-xs text-slate-600 block mb-0.5">Payment Intent</span>
                  <p className="font-mono text-xs text-slate-600 break-all">{order.stripePaymentId.slice(0, 28)}…</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping address */}
          {snap && (
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-indigo-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Lieferadresse</h3>
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

          {/* Tracking */}
          {(order.trackingNumber || order.shippingProvider) && (
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-indigo-400" />
                <h3 className="font-semibold text-slate-200 text-sm">Versand</h3>
              </div>
              <div className="space-y-1.5 text-sm">
                {order.shippingProvider && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dienstleister</span>
                    <span className="text-slate-200">{order.shippingProvider}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div>
                    <span className="text-xs text-slate-600 block mb-0.5">Tracking-Nummer</span>
                    <p className="font-mono text-xs text-indigo-400">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
