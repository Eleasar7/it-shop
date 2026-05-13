// app/(admin)/admin/customers/[id]/page.tsx

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ChevronLeft, ShoppingBag, FileText, Building2,
  Mail, Phone, Tag, Edit2,
} from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CustomerNoteForm } from "./CustomerNoteForm";
import { CustomerCRMForm } from "./CustomerCRMForm";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Kundenprofil | TechCore Admin" };

export default async function CustomerDetailPage({ params }: PageProps) {
  const admin = await requireAdmin();
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id, role: "USER" },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { items: true } } },
      },
      b2bRequests: { orderBy: { createdAt: "desc" }, take: 5 },
      quotes:      { orderBy: { createdAt: "desc" }, take: 5 },
      customerNotes: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!customer) notFound();

  const totalSpent = customer.orders
    .filter((o) => o.paymentStatus === "PAID")
    .reduce((s, o) => s + Number(o.totalAmount), 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="space-y-6 pb-8">
      <Link href="/admin/customers"
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ChevronLeft size={15} /> Kunden
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-lg font-black text-indigo-400">
            {(customer.name ?? customer.email)[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">{customer.name ?? "–"}</h1>
            <p className="text-slate-400 text-sm">{customer.email}</p>
            {customer.company && <p className="text-slate-500 text-sm">{customer.company}</p>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {customer.b2bStatus !== "NONE" && (
            <span className={`badge ${
              customer.b2bStatus === "ACTIVE"   ? "badge-success" :
              customer.b2bStatus === "PROSPECT" ? "badge-info"    :
              "badge-neutral"
            }`}>B2B: {customer.b2bStatus}</span>
          )}
          {customer.tags.map((tag) => (
            <span key={tag} className="badge badge-neutral">
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Bestellungen",   value: customer.orders.length },
          { label: "Gesamtumsatz",   value: fmt(totalSpent) },
          { label: "B2B-Anfragen",   value: customer.b2bRequests.length },
          { label: "Angebote",       value: customer.quotes.length },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-lg font-bold text-slate-100">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: activity */}
        <div className="lg:col-span-2 space-y-5">

          {/* Recent orders */}
          {customer.orders.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
                <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <ShoppingBag size={14} className="text-indigo-400" /> Letzte Bestellungen
                </h2>
                <Link href={`/admin/orders?q=${customer.email}`}
                  className="text-xs text-indigo-400 hover:text-indigo-300">Alle →</Link>
              </div>
              <div className="divide-y divide-slate-700/30">
                {customer.orders.map((o) => (
                  <Link key={o.id} href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition-colors group">
                    <div>
                      <p className="text-sm font-mono text-slate-300">#{o.orderNumber.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{o._count.items} Artikel · {new Date(o.createdAt).toLocaleDateString("de-DE")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="order" value={o.status} />
                      <span className="text-sm font-semibold text-slate-200 tabular-nums">{fmt(Number(o.totalAmount))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent quotes */}
          {customer.quotes.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/50">
                <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <FileText size={14} className="text-indigo-400" /> Angebote
                </h2>
              </div>
              <div className="divide-y divide-slate-700/30">
                {customer.quotes.map((q) => (
                  <Link key={q.id} href={`/admin/quotes/${q.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition-colors">
                    <div>
                      <p className="text-sm font-mono text-slate-300">#{q.quoteNumber.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{new Date(q.createdAt).toLocaleDateString("de-DE")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="quote" value={q.status} />
                      <span className="text-sm font-semibold text-slate-200 tabular-nums">{fmt(Number(q.totalAmount))}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent B2B */}
          {customer.b2bRequests.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/50">
                <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-400" /> B2B-Anfragen
                </h2>
              </div>
              <div className="divide-y divide-slate-700/30">
                {customer.b2bRequests.map((req) => (
                  <Link key={req.id} href={`/admin/b2b/${req.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition-colors">
                    <p className="text-sm text-slate-300 truncate">{req.companyName}</p>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <StatusBadge type="b2b" value={req.status} />
                      <span className="text-xs text-slate-500">{new Date(req.createdAt).toLocaleDateString("de-DE")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Notes timeline */}
          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-slate-200 text-sm">Notizen</h2>
            <CustomerNoteForm customerId={id} adminId={admin.id} />
            {customer.customerNotes.length > 0 && (
              <div className="space-y-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {customer.customerNotes.map((note) => (
                  <div key={note.id} className="text-sm">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-slate-600 mt-1">{new Date(note.createdAt).toLocaleString("de-DE")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: CRM fields */}
        <div className="space-y-4">
          <CustomerCRMForm
            customerId={id}
            initialData={{
              company:       customer.company       ?? "",
              phone:         customer.phone         ?? "",
              vatId:         (customer as any).vatId ?? "",
              b2bStatus:     (customer as any).b2bStatus ?? "NONE",
              tags:          (customer as any).tags?.join(", ") ?? "",
              internalNotes: (customer as any).internalNotes ?? "",
            }}
          />

          {/* Contact */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-slate-200 text-sm">Kontakt</h3>
            <a href={`mailto:${customer.email}`} className="btn-secondary w-full text-sm justify-center">
              <Mail size={13} /> E-Mail senden
            </a>
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="btn-secondary w-full text-sm justify-center">
                <Phone size={13} /> Anrufen
              </a>
            )}
            <Link href={`/admin/quotes/new?email=${customer.email}&name=${encodeURIComponent(customer.name ?? "")}&company=${encodeURIComponent(customer.company ?? "")}`}
              className="btn-primary w-full text-sm justify-center">
              <FileText size={13} /> Angebot erstellen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
