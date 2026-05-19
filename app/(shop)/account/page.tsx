// app/(shop)/account/page.tsx

import { requireAuth } from "@/lib/auth";
import { siteConfig } from "@/lib/site-config";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  ChevronRight,
  User,
  MapPin,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Mein Konto | ${siteConfig.siteName}` };

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  PENDING:    { label: "Ausstehend",     badge: "badge-warning" },
  CONFIRMED:  { label: "Bestätigt",      badge: "badge-info" },
  PROCESSING: { label: "In Bearbeitung", badge: "badge-info" },
  SHIPPED:    { label: "Versendet",      badge: "badge-info" },
  DELIVERED:  { label: "Geliefert",      badge: "badge-success" },
  CANCELLED:  { label: "Storniert",      badge: "badge-danger" },
  REFUNDED:   { label: "Erstattet",      badge: "badge-neutral" },
};

/** Safe initials: never crashes on empty email */
function getInitials(name: string | null | undefined, email: string): string {
  const src = name?.trim() || email?.trim() || "?";
  return src
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";
}

export default async function AccountPage() {
  const user = await requireAuth();

  // Use only snapshot fields on OrderItem — never include the product relation
  // because the product may have been deleted since the order was placed.
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          productName: true,
          imageUrl: true,
          quantity: true,
          unitPrice: true,
        },
        take: 3,
      },
      _count: { select: { items: true } },
    },
  });

  const totalSpent = orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((s, o) => s + Number(o.totalAmount), 0);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const initials = getInitials(user.name, user.email);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ─── Hero header ─── */}
      <div className="card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg shadow-indigo-500/20 select-none">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {user.name ? `Hallo, ${user.name.split(" ")[0]}!` : "Mein Konto"}
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">{user.email}</p>
              {user.company && (
                <p className="text-xs text-[#1a56db] mt-1">{user.company}</p>
              )}
            </div>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#e8eaed]">
          {[
            { label: "Bestellungen", value: String(orders.length) },
            { label: "Ausgegeben",   value: formatPrice(totalSpent) },
            {
              label: "Mitglied seit",
              value: user.createdAt
		? new Date(user.createdAt).toLocaleDateString("de-DE", {
                  month: "short",
                  year: "numeric",
                })
	      : "-",
            },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-base sm:text-lg font-bold text-gray-900 tabular-nums truncate">
                {value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Quick links ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/account/orders",    icon: Package,    label: "Bestellungen" },
          { href: "/account/profile",   icon: User,       label: "Profil" },
          { href: "/account/addresses", icon: MapPin,     label: "Adressen" },
          { href: "/products",          icon: ShoppingBag, label: "Shop" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="card-hover flex flex-col items-center gap-2.5 p-4 text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-indigo-600/15 border border-slate-700/40 group-hover:border-indigo-500/30 flex items-center justify-center transition-all">
              <Icon
                size={18}
                className="text-gray-600 group-hover:text-[#1a56db] transition-colors"
              />
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* ─── Recent orders ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Package size={16} className="text-[#1a56db]" />
            Letzte Bestellungen
          </h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs text-[#1a56db] hover:text-[#1043b2] flex items-center gap-1 transition-colors"
            >
              Alle anzeigen <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="card p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100/60 border border-slate-700/40 flex items-center justify-center mx-auto">
              <ShoppingBag size={28} className="text-gray-500" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">Noch keine Bestellungen</p>
              <p className="text-gray-500 text-sm mt-1">
                Entdecke unsere Produkte und leg los!
              </p>
            </div>
            <Link href="/products" className="btn-primary inline-flex mt-2">
              Weiter einkaufen
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status =
                STATUS_CONFIG[order.status] ?? STATUS_CONFIG["PENDING"];
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="card-hover block p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800 font-mono">
                          #{order.orderNumber.slice(-8).toUpperCase()}
                        </span>
                        <span className={`badge ${status.badge}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {new Date(order.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                        {" · "}
                        {order._count.items}{" "}
                        {order._count.items === 1 ? "Artikel" : "Artikel"}
                      </p>

                      {/* Item name chips */}
                      <div className="mt-2.5 flex gap-1.5 flex-wrap">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-1.5 bg-gray-100/60 border border-slate-700/40 rounded-lg px-2.5 py-1 max-w-[160px]"
                          >
                            {item.imageUrl ? (
                              <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 relative bg-gray-200">
                                <Image
                                  src={item.imageUrl}
                                  alt=""
                                  fill
                                  className="object-contain"
                                  sizes="20px"
                                />
                              </div>
                            ) : null}
                            <span className="text-xs text-gray-600 truncate">
                              {item.productName}
                            </span>
                          </div>
                        ))}
                        {order._count.items > 3 && (
                          <span className="text-xs text-gray-500 bg-[#f8f9fa] px-2.5 py-1 rounded-lg">
                            +{order._count.items - 3} weitere
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold text-gray-900 tabular-nums">
                        {formatPrice(Number(order.totalAmount))}
                      </p>
                      <ChevronRight
                        size={15}
                        className="text-gray-500 ml-auto mt-2"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}

            <Link
              href="/account/orders"
              className="flex items-center justify-center gap-2 w-full py-3 text-sm text-[#1a56db] hover:text-[#1043b2] transition-colors card-hover rounded-xl"
            >
              Alle Bestellungen anzeigen
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* ─── Profile summary card ─── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
            <User size={15} className="text-[#1a56db]" />
            Profil
          </h2>
          <Link
            href="/account/profile"
            className="text-xs text-[#1a56db] hover:text-[#1043b2] flex items-center gap-1 transition-colors"
          >
            Bearbeiten <ArrowRight size={11} />
          </Link>
        </div>
        <div className="divide-y divide-slate-700/40">
          {[
            { label: "Name",         value: user.name    ?? "–" },
            { label: "E-Mail",       value: user.email },
            { label: "Unternehmen",  value: user.company ?? "–" },
            { label: "Telefon",      value: user.phone   ?? "–" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5 text-sm">
              <span className="text-gray-600">{label}</span>
              <span className="text-gray-800 text-right max-w-[60%] truncate">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
