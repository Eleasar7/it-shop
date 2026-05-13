// app/(admin)/admin/quotes/[id]/page.tsx

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Copy } from "lucide-react";
import { QuoteStatusForm } from "./QuoteStatusForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Angebot | TechCore Admin" };

export default async function AdminQuoteDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where:   { id },
    include: { items: true },
  });
  if (!quote) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const base       = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const publicLink = `${base}/quotes/${quote.accessToken}`;

  const isExpired = quote.status === "SENT" && quote.validUntil && quote.validUntil < new Date();

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/quotes" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronLeft size={15} /> Angebote
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-slate-100 font-mono">
              #{quote.quoteNumber.slice(-6).toUpperCase()}
            </h1>
            <StatusBadge type="quote" value={isExpired ? "EXPIRED" : quote.status} />
          </div>
          <p className="text-slate-500 text-sm">Erstellt: {new Date(quote.createdAt).toLocaleString("de-DE")}</p>
        </div>
        {/* Public link */}
        <div className="flex items-center gap-2">
          <Link href={publicLink} target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-sm">
            <ExternalLink size={13} /> Kundenansicht
          </Link>
          <Link href={`/admin/quotes/new?${quote.b2bRequestId ? `b2bId=${quote.b2bRequestId}` : ""}`}
            className="btn-secondary text-sm">
            Duplizieren
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items + totals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-700/50">
              <h2 className="font-semibold text-slate-200 text-sm">Positionen ({quote.items.length})</h2>
            </div>
            <div className="divide-y divide-slate-700/30">
              {quote.items.map((item, idx) => (
                <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{item.productName}</p>
                    {item.productSku && <p className="text-xs text-slate-500 font-mono mt-0.5">{item.productSku}</p>}
                    {item.note && <p className="text-xs text-slate-500 italic mt-0.5">{item.note}</p>}
                  </div>
                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <p className="text-sm text-slate-400">{item.quantity} × {fmt(Number(item.unitPrice))}</p>
                    <p className="text-sm font-semibold text-slate-200 tabular-nums">{fmt(Number(item.totalPrice))}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-700/50 space-y-2 bg-slate-800/20">
              {[
                ["Nettobetrag",   Number(quote.subtotal)],
                ["MwSt. (19%)",   Number(quote.taxAmount)],
              ].map(([l, v]) => (
                <div key={l as string} className="flex justify-between text-sm text-slate-400">
                  <span>{l}</span><span className="tabular-nums">{fmt(v as number)}</span>
                </div>
              ))}
              <div className="flex justify-between font-black text-base pt-2 border-t border-slate-700/50">
                <span className="text-slate-100">Gesamt (brutto)</span>
                <span className="text-slate-50 tabular-nums">{fmt(Number(quote.totalAmount))}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(quote.notes || quote.adminNotes) && (
            <div className="card p-5 space-y-4">
              {quote.notes && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Kundennotiz</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{quote.notes}</p>
                </div>
              )}
              {quote.adminNotes && (
                <div style={{ borderTop: quote.notes ? "1px solid rgba(255,255,255,0.06)" : "none", paddingTop: quote.notes ? "1rem" : 0 }}>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">Interne Notiz</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{quote.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Public link display */}
          <div className="card p-4 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Öffentlicher Link</p>
            <p className="text-xs text-slate-400 font-mono break-all">{publicLink}</p>
            <p className="text-xs text-slate-600">Diesen Link per E-Mail an den Kunden senden. Kein Login erforderlich.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <QuoteStatusForm
            quoteId={id}
            currentStatus={quote.status}
            currentAdminNotes={quote.adminNotes ?? ""}
          />

          {/* Customer info */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-slate-200 text-sm">Kunde</h3>
            <div className="space-y-1.5 text-sm">
              {[
                { l: "Name",    v: quote.customerName },
                { l: "E-Mail",  v: quote.customerEmail },
                { l: "Firma",   v: quote.customerCompany },
                { l: "USt.-ID", v: quote.customerVatId },
                { l: "Telefon", v: quote.customerPhone },
                { l: "Gültig bis", v: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString("de-DE") : null },
              ].filter(({ v }) => v).map(({ l, v }) => (
                <div key={l} className="flex gap-2">
                  <span className="text-slate-500 w-16 flex-shrink-0">{l}</span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edit button */}
          <Link href={`/admin/quotes/${id}/edit`} className="btn-secondary w-full justify-center text-sm">
            Angebot bearbeiten
          </Link>
        </div>
      </div>
    </div>
  );
}
