// app/(admin)/admin/orders/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bestellungen | Envetra Admin" };

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING:    { label: "Ausstehend",     badge: "badge-warning" },
  CONFIRMED:  { label: "Bestätigt",      badge: "badge-info" },
  PROCESSING: { label: "In Bearbeitung", badge: "badge-info" },
  SHIPPED:    { label: "Versendet",      badge: "badge-info" },
  DELIVERED:  { label: "Geliefert",      badge: "badge-success" },
  CANCELLED:  { label: "Storniert",      badge: "badge-danger" },
  REFUNDED:   { label: "Erstattet",      badge: "badge-neutral" },
};

const PAY_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING:             { label: "Ausstehend", badge: "badge-warning" },
  PAID:                { label: "Bezahlt",    badge: "badge-success" },
  FAILED:              { label: "Fehlgeschl.",badge: "badge-danger" },
  REFUNDED:            { label: "Erstattet",  badge: "badge-neutral" },
  PARTIALLY_REFUNDED:  { label: "Teil-Erst.", badge: "badge-warning" },
};

interface PageProps {
  searchParams: Promise<{ status?: string; pay?: string; q?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status, pay, q } = await searchParams;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      ...(status && { status: status as any }),
      ...(pay    && { paymentStatus: pay as any }),
      ...(q && {
        OR: [
          { customerEmail: { contains: q, mode: "insensitive" } },
          { customerName:  { contains: q, mode: "insensitive" } },
          { orderNumber:   { contains: q, mode: "insensitive" } },
          { user: { email: { contains: q, mode: "insensitive" } } },
        ],
      }),
    },
    include: {
      user:   { select: { email: true, name: true } },
      _count: { select: { items: true } },
    },
    take: 200,
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const STATUS_FILTERS = [
    { label: "Alle",          value: "" },
    { label: "Ausstehend",    value: "PENDING" },
    { label: "Bestätigt",     value: "CONFIRMED" },
    { label: "In Bearb.",     value: "PROCESSING" },
    { label: "Versendet",     value: "SHIPPED" },
    { label: "Geliefert",     value: "DELIVERED" },
    { label: "Storniert",     value: "CANCELLED" },
  ];

  function buildHref(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (pay)    params.set("pay", pay);
    if (q)      params.set("q", q);
    Object.entries(overrides).forEach(([k, v]) => { if (v) params.set(k, v); else params.delete(k); });
    return `/admin/orders?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Bestellungen</h1>
        <p className="text-slate-500 text-sm mt-1">{orders.length} Bestellungen</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/orders" className="relative flex-1 flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          {pay    && <input type="hidden" name="pay"    value={pay} />}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="E-Mail, Name oder Bestellnummer…"
              className="input pl-9 w-full"
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn-secondary px-4">Suchen</button>
          {q && (
            <Link href={buildHref({ q: "" })} className="btn-secondary px-3 text-slate-500">✕</Link>
          )}
        </form>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => {
          const active = (status ?? "") === value;
          return (
            <Link
              key={value}
              href={buildHref({ status: value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                {["#", "Kunde", "E-Mail", "Artikel", "Betrag", "Status", "Zahlung", "Datum", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {orders.map((order) => {
                const s = STATUS_CONFIG[order.status];
                const p = PAY_CONFIG[order.paymentStatus];
                const email = order.customerEmail || order.user.email;
                const name  = order.customerName  || order.user.name;
                return (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                      #{order.orderNumber.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-200 truncate max-w-[120px]">{name ?? "–"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">{email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{order._count.items}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200 whitespace-nowrap tabular-nums">
                      {fmt(Number(order.totalAmount))}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${s?.badge ?? "badge-neutral"}`}>{s?.label ?? order.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${p?.badge ?? "badge-neutral"}`}>{p?.label ?? order.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href={`/admin/orders/${order.id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 flex items-center">
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <ShoppingBag size={36} className="mx-auto mb-3 text-slate-700" />
                    <p className="text-slate-400">Keine Bestellungen gefunden</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
