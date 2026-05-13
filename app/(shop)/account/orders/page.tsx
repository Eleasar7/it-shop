// app/(shop)/account/orders/page.tsx

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meine Bestellungen | TechCore" };

const STATUS_BADGE: Record<string, string> = {
  PENDING:    "badge-warning",
  CONFIRMED:  "badge-info",
  PROCESSING: "badge-info",
  SHIPPED:    "badge-info",
  DELIVERED:  "badge-success",
  CANCELLED:  "badge-danger",
  REFUNDED:   "badge-neutral",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING:    "Ausstehend",
  CONFIRMED:  "Bestätigt",
  PROCESSING: "In Bearbeitung",
  SHIPPED:    "Versendet",
  DELIVERED:  "Geliefert",
  CANCELLED:  "Storniert",
  REFUNDED:   "Erstattet",
};

export default async function OrdersPage() {
  const user = await requireAuth();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/account"
            className="text-xs text-gray-9000 hover:text-gray-700 transition-colors mb-2 inline-flex items-center gap-1"
          >
            ← Konto
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Meine Bestellungen</h1>
          <p className="text-gray-9000 text-sm mt-1">{orders.length} Bestellungen gesamt</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gray-100/60 border border-slate-700/40 flex items-center justify-center mx-auto">
            <ShoppingBag size={28} className="text-gray-9000" />
          </div>
          <div>
            <p className="text-gray-700 font-medium text-lg">Noch keine Bestellungen</p>
            <p className="text-gray-9000 text-sm mt-1">
              Stöbere in unserem Sortiment und finde dein nächstes Gerät.
            </p>
          </div>
          <Link href="/products" className="btn-primary inline-flex">
            Weiter einkaufen
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-[#e8eaed]">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800 font-mono group-hover:text-white transition-colors">
                      #{order.orderNumber.slice(-8).toUpperCase()}
                    </span>
                    <span className={`badge ${STATUS_BADGE[order.status] ?? "badge-neutral"}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    {order.paymentStatus === "PAID" && (
                      <span className="badge badge-success text-[10px]">✓ Bezahlt</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-9000 mt-1">
                    {new Date(order.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit", month: "long", year: "numeric",
                    })}
                    {" · "}
                    {order._count.items} {order._count.items === 1 ? "Artikel" : "Artikel"}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm font-bold text-gray-800 tabular-nums">
                    {fmt(Number(order.totalAmount))}
                  </span>
                  <ChevronRight size={14} className="text-gray-9000 group-hover:text-gray-700 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
