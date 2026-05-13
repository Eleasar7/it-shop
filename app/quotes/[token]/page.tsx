// app/quotes/[token]/page.tsx
// Secure public quote page — accessible via unique token, no login required.

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuoteResponseClient } from "./QuoteResponseClient";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const quote = await prisma.quote.findUnique({
    where: { accessToken: token },
    select: { quoteNumber: true, customerCompany: true },
  });
  if (!quote) return { title: "Angebot nicht gefunden" };
  return { title: `Angebot #${quote.quoteNumber.slice(-6).toUpperCase()} | TechCore` };
}

export default async function PublicQuotePage({ params }: PageProps) {
  const { token } = await params;

  const quote = await prisma.quote.findUnique({
    where:   { accessToken: token },
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!quote) notFound();

  const isExpired =
    quote.status === "SENT" && quote.validUntil && quote.validUntil < new Date();

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const QUOTE_STATUS_LABELS: Record<string, string> = {
    DRAFT:    "Entwurf",
    SENT:     "Warte auf Ihre Antwort",
    ACCEPTED: "Von Ihnen akzeptiert",
    REJECTED: "Von Ihnen abgelehnt",
    EXPIRED:  "Abgelaufen",
  };

  const showActions = quote.status === "SENT" && !isExpired;

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: "rgb(var(--bg-base))" }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">TechCore</span>
              <span className="text-slate-700">·</span>
              <span className="text-xs font-mono text-slate-500">
                Angebot #{quote.quoteNumber.slice(-6).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-50">
              {quote.customerCompany
                ? `Angebot für ${quote.customerCompany}`
                : "Ihr individuelles Angebot"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {QUOTE_STATUS_LABELS[isExpired ? "EXPIRED" : quote.status]}
            </p>
          </div>
          {quote.validUntil && (
            <div className="text-right">
              <p className="text-xs text-slate-600 font-medium">Gültig bis</p>
              <p className={`text-sm font-bold ${isExpired ? "text-red-400" : "text-slate-300"}`}>
                {new Date(quote.validUntil).toLocaleDateString("de-DE", {
                  day: "2-digit", month: "long", year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Items table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-700/50">
            <h2 className="font-semibold text-slate-200 text-sm">Angebotsinhalt</h2>
          </div>
          <div className="divide-y divide-slate-700/30">
            {quote.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{item.productName}</p>
                  {item.productSku && <p className="text-xs text-slate-500 font-mono mt-0.5">{item.productSku}</p>}
                  {item.note && <p className="text-xs text-slate-500 italic mt-0.5">{item.note}</p>}
                </div>
                <div className="text-right flex-shrink-0 space-y-0.5">
                  <p className="text-sm text-slate-400">{item.quantity} × {fmt(Number(item.unitPrice))}</p>
                  <p className="text-base font-bold text-slate-100 tabular-nums">{fmt(Number(item.totalPrice))}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-slate-700/50 space-y-2 bg-slate-800/20">
            {[
              { label: "Nettobetrag", value: Number(quote.subtotal) },
              { label: "MwSt. (19%)", value: Number(quote.taxAmount) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm text-slate-400">
                <span>{label}</span>
                <span className="tabular-nums">{fmt(value)}</span>
              </div>
            ))}
            <div className="flex justify-between font-black text-lg pt-2 border-t border-slate-700/50">
              <span className="text-slate-100">Gesamtbetrag (inkl. MwSt.)</span>
              <span className="text-slate-50 tabular-nums">{fmt(Number(quote.totalAmount))}</span>
            </div>
          </div>
        </div>

        {/* Customer notes */}
        {quote.notes && (
          <div className="card p-5">
            <h2 className="font-semibold text-slate-200 text-sm mb-3">Hinweise</h2>
            <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">{quote.notes}</p>
          </div>
        )}

        {/* Accept/Reject actions */}
        {showActions && (
          <QuoteResponseClient accessToken={token} />
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-700 font-medium">
          TechCore GmbH · Königstraße 1 · 70173 Stuttgart · info@techcore-shop.de
        </p>
      </div>
    </div>
  );
}
