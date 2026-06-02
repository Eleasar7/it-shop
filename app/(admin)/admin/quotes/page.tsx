// app/(admin)/admin/quotes/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Angebote | Envetra Admin" };

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminQuotesPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status, q } = await searchParams;

  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      ...(status && { status: status as any }),
      ...(q && {
        OR: [
          { customerEmail:   { contains: q, mode: "insensitive" } },
          { customerName:    { contains: q, mode: "insensitive" } },
          { customerCompany: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: { _count: { select: { items: true } } },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const FILTERS = [
    { label: "Alle",         value: "" },
    { label: "Entwurf",      value: "DRAFT" },
    { label: "Gesendet",     value: "SENT" },
    { label: "Akzeptiert",   value: "ACCEPTED" },
    { label: "Abgelehnt",    value: "REJECTED" },
    { label: "Abgelaufen",   value: "EXPIRED" },
  ];

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q)      p.set("q", q);
    Object.entries(overrides).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    return `/admin/quotes?${p}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Angebote</h1>
          <p className="text-slate-500 text-sm mt-1">{quotes.length} Angebote</p>
        </div>
        <Link href="/admin/quotes/new" className="btn-primary">
          <Plus size={15} /> Neues Angebot
        </Link>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/quotes" className="flex gap-2 max-w-md">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Kunde, E-Mail, Firma…"
          className="input text-sm flex-1" autoComplete="off" />
        <button type="submit" className="btn-secondary px-3 text-sm">Suchen</button>
        {q && <Link href={buildHref({ q: "" })} className="btn-secondary px-3 text-slate-500 text-sm">✕</Link>}
      </form>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(({ label, value }) => {
          const active = (status ?? "") === value;
          return (
            <Link key={value} href={buildHref({ status: value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {quotes.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">Keine Angebote gefunden</p>
          <Link href="/admin/quotes/new" className="btn-primary inline-flex mt-4">
            <Plus size={14} /> Angebot erstellen
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/40">
                  {["#", "Kunde", "Firma", "Betrag", "Status", "Gültig bis", "Erstellt", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {quotes.map((q) => {
                  const isExpired = q.status === "SENT" && q.validUntil && q.validUntil < new Date();
                  return (
                    <tr key={q.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                        #{q.quoteNumber.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-200 font-medium truncate max-w-[140px]">{q.customerName ?? q.customerEmail}</p>
                        <p className="text-xs text-slate-500 truncate">{q.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs truncate max-w-[120px]">
                        {q.customerCompany ?? "–"}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-200 tabular-nums whitespace-nowrap">
                        {fmt(Number(q.totalAmount))}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge type="quote" value={isExpired ? "EXPIRED" : q.status} />
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString("de-DE") : "–"}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleDateString("de-DE")}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/quotes/${q.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 flex items-center">
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
