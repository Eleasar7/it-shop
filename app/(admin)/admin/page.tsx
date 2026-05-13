// app/(admin)/admin/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  TrendingUp, ShoppingBag, Package, Users,
  AlertTriangle, Clock, CheckCircle, ArrowRight,
  Plus, Building2, Calendar, Bell,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | TechCore Admin" };

async function getStats() {
  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Execute all queries in one Promise.all ──────────────────────────────
  const [
    totalOrders,
    pendingOrders,
    revenueAll,
    revenueToday,
    revenueMonth,
    totalProducts,
    activeProducts,
    lowStockCount,
    totalCustomers,
    recentOrders,
    lowStockProducts,
    openB2B,
    recentB2B,
    unreadNotifications,
    topSellers,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: todayStart } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID", createdAt: { gte: monthStart } }, _sum: { totalAmount: true } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 5 } } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user:   { select: { email: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.product.findMany({
      where:   { isActive: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take:    6,
      select:  { id: true, name: true, stock: true, brand: true },
    }),
    prisma.b2BRequest.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    prisma.b2BRequest.findMany({
      where:   { status: { in: ["OPEN", "IN_REVIEW"] } },
      orderBy: { createdAt: "desc" },
      take:    4,
      select:  { id: true, companyName: true, contactName: true, status: true, createdAt: true },
    }),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.orderItem.groupBy({
      by:      ["productId"],
      _sum:    { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take:    5,
    }),
  ]);

  // Enrich top sellers with product names
  const topProductIds = topSellers.map((t) => t.productId);
  const topProducts   = topProductIds.length > 0
    ? await prisma.product.findMany({
        where:  { id: { in: topProductIds } },
        select: { id: true, name: true, brand: true, price: true },
      })
    : [];

  const topSellersEnriched = topSellers.map((t) => ({
    ...t,
    product: topProducts.find((p) => p.id === t.productId) ?? null,
  }));

  return {
    totalOrders,
    pendingOrders,
    revenue:             Number(revenueAll._sum.totalAmount   ?? 0),
    revenueToday:        Number(revenueToday._sum.totalAmount ?? 0),
    revenueMonth:        Number(revenueMonth._sum.totalAmount ?? 0),
    totalProducts,
    activeProducts,
    lowStockCount,
    totalCustomers,
    recentOrders,
    lowStockProducts,
    openB2B,
    recentB2B,
    unreadNotifications,
    topSellers: topSellersEnriched,
  };
}

// ── Status helpers ────────────────────────────────────────────────────────────

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
  PROCESSING: "In Bearb.",
  SHIPPED:    "Versendet",
  DELIVERED:  "Geliefert",
  CANCELLED:  "Storniert",
  REFUNDED:   "Erstattet",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default async function AdminDashboard() {
  await requireAdmin();
  const s = await getStats();

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const STAT_CARDS = [
    {
      label: "Umsatz gesamt",
      value: fmt(s.revenue),
      icon:  TrendingUp,
      color: "text-green-400",
      bg:    "bg-green-500/10 border-green-500/20",
      sub:   `Heute: ${fmt(s.revenueToday)}`,
      href:  "/admin/orders",
    },
    {
      label: "Monatsumsatz",
      value: fmt(s.revenueMonth),
      icon:  Calendar,
      color: "text-emerald-400",
      bg:    "bg-emerald-500/10 border-emerald-500/20",
      sub:   new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" }),
      href:  "/admin/orders",
    },
    {
      label: "Bestellungen",
      value: s.totalOrders,
      icon:  ShoppingBag,
      color: "text-indigo-400",
      bg:    "bg-indigo-500/10 border-indigo-500/20",
      sub:   `${s.pendingOrders} ausstehend`,
      href:  "/admin/orders",
    },
    {
      label: "Aktive Produkte",
      value: s.activeProducts,
      icon:  Package,
      color: "text-blue-400",
      bg:    "bg-blue-500/10 border-blue-500/20",
      sub:   s.lowStockCount > 0 ? `${s.lowStockCount} niedriger Bestand` : `${s.totalProducts} gesamt`,
      href:  "/admin/products",
    },
    {
      label: "Kunden",
      value: s.totalCustomers,
      icon:  Users,
      color: "text-violet-400",
      bg:    "bg-violet-500/10 border-violet-500/20",
      sub:   "Registrierte Nutzer",
      href:  "/admin/customers",
    },
    {
      label: "B2B-Anfragen",
      value: s.openB2B,
      icon:  Building2,
      color: "text-amber-400",
      bg:    "bg-amber-500/10 border-amber-500/20",
      sub:   "Offen / In Prüfung",
      href:  "/admin/b2b",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {s.unreadNotifications > 0 && (
            <Link href="#" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              <Bell size={13} /> {s.unreadNotifications} neu
            </Link>
          )}
          <Link href="/admin/products/new" className="btn-primary hidden sm:inline-flex">
            <Plus size={15} /> Produkt erstellen
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, sub, href }) => (
          <Link
            key={label}
            href={href}
            className="card p-4 space-y-3 hover:border-slate-600/60 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <p className="text-xs text-slate-400 leading-snug">{label}</p>
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${bg}`}>
                <Icon size={13} className={color} />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-100 tabular-nums leading-none">{value}</p>
            <p className="text-xs text-slate-500 truncate">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <Clock size={14} className="text-slate-400" /> Letzte Bestellungen
            </h2>
            <Link href="/admin/orders"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
              Alle <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-700/30">
            {s.recentOrders.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                    {order.user.name ?? order.user.email}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {order._count.items} Artikel · {new Date(order.createdAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className={`badge ${STATUS_BADGE[order.status] ?? "badge-neutral"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-sm font-semibold text-slate-200 tabular-nums">
                    {fmt(Number(order.totalAmount))}
                  </span>
                </div>
              </Link>
            ))}
            {s.recentOrders.length === 0 && (
              <p className="px-5 py-10 text-center text-slate-500 text-sm">Noch keine Bestellungen</p>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <AlertTriangle size={14} className="text-yellow-400" /> Geringer Bestand
            </h2>
            <Link href="/admin/products?status=lowstock"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Alle →
            </Link>
          </div>
          <div className="divide-y divide-slate-700/30">
            {s.lowStockProducts.map((p) => (
              <Link key={p.id} href={`/admin/products/${p.id}/edit`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm text-slate-300 group-hover:text-white transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-slate-600">{p.brand}</p>
                </div>
                <span className={`badge flex-shrink-0 ml-2 ${p.stock === 0 ? "badge-danger" : "badge-warning"}`}>
                  {p.stock === 0 ? "Leer" : `${p.stock} Stk.`}
                </span>
              </Link>
            ))}
            {s.lowStockProducts.length === 0 && (
              <div className="px-5 py-8 text-center">
                <CheckCircle size={20} className="text-green-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Alles gut bestückt</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top sellers */}
        {s.topSellers.length > 0 && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
              <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                <TrendingUp size={14} className="text-green-400" /> Top-Seller (gesamt)
              </h2>
            </div>
            <div className="divide-y divide-slate-700/30">
              {s.topSellers.map((t, idx) => t.product && (
                <Link key={t.productId} href={`/admin/products/${t.productId}/edit`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/40 transition-colors group">
                  <span className="text-xs font-black text-slate-700 w-4 flex-shrink-0">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">
                      {t.product.name}
                    </p>
                    <p className="text-xs text-slate-600">{t.product.brand}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-200 tabular-nums">{t._sum.quantity} Stk.</p>
                    <p className="text-xs text-slate-600">verkauft</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Open B2B inquiries */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
            <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
              <Building2 size={14} className="text-amber-400" /> Offene B2B-Anfragen
            </h2>
            <Link href="/admin/b2b"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Alle →
            </Link>
          </div>
          <div className="divide-y divide-slate-700/30">
            {s.recentB2B.map((req) => (
              <Link key={req.id} href={`/admin/b2b/${req.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/40 transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors truncate">
                    {req.companyName}
                  </p>
                  <p className="text-xs text-slate-600">{req.contactName}</p>
                </div>
                <span className={`badge flex-shrink-0 ml-2 ${req.status === "OPEN" ? "badge-warning" : "badge-info"}`}>
                  {req.status === "OPEN" ? "Neu" : "In Prüfung"}
                </span>
              </Link>
            ))}
            {s.recentB2B.length === 0 && (
              <p className="px-5 py-10 text-center text-slate-500 text-sm">Keine offenen Anfragen</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Schnellaktionen</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="btn-primary">
            <Package size={14} /> Produkt erstellen
          </Link>
          <Link href="/admin/orders" className="btn-secondary">
            <ShoppingBag size={14} /> Bestellungen
          </Link>
          <Link href="/admin/customers" className="btn-secondary">
            <Users size={14} /> Kunden
          </Link>
          <Link href="/admin/b2b" className="btn-secondary">
            <Building2 size={14} /> B2B-Anfragen
          </Link>
        </div>
      </div>
    </div>
  );
}
