// app/(admin)/admin/b2b/[id]/page.tsx

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Building2, Mail, Phone, Package, User } from "lucide-react";
import { B2BStatusForm } from "./B2BStatusForm";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "B2B-Anfrage | Envetra Admin" };

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  OPEN:      { label: "Neu / Offen",       badge: "badge-warning" },
  IN_REVIEW: { label: "In Prüfung",        badge: "badge-info" },
  QUOTED:    { label: "Angebot gesendet",  badge: "badge-info" },
  ACCEPTED:  { label: "Gewonnen",          badge: "badge-success" },
  REJECTED:  { label: "Abgelehnt",         badge: "badge-danger" },
  CLOSED:    { label: "Geschlossen",       badge: "badge-neutral" },
};

export default async function AdminB2BDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const req = await prisma.b2BRequest.findUnique({
    where: { id },
    include: { user: { select: { email: true, name: true } } },
  });
  if (!req) notFound();

  const cfg = STATUS_CONFIG[req.status];

  return (
    <div className="space-y-6 pb-8">
      <Link href="/admin/b2b"
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ChevronLeft size={15} /> Zurück zu B2B-Anfragen
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-slate-100">{req.companyName}</h1>
            <span className={`badge ${cfg?.badge ?? "badge-neutral"}`}>
              {cfg?.label ?? req.status}
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Eingegangen: {new Date(req.createdAt).toLocaleString("de-DE")}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: detail panels */}
        <div className="lg:col-span-2 space-y-4">

          {/* Contact info */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-indigo-400" />
              <h2 className="font-semibold text-slate-200 text-sm">Kontaktdaten</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: "Unternehmen",     value: req.companyName },
                { label: "Ansprechpartner", value: req.contactName },
                { label: "E-Mail",  value: req.email, href: `mailto:${req.email}` },
                { label: "Telefon", value: req.phone ?? "–", href: req.phone ? `tel:${req.phone}` : undefined },
              ].map(({ label, value, href }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-300">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="card p-5 space-y-3">
            <h2 className="font-semibold text-slate-200 text-sm">Nachricht</h2>
            <div className="bg-slate-900/50 rounded-xl p-4 text-sm text-slate-300 border border-slate-700/30 leading-relaxed whitespace-pre-wrap">
              {req.message}
            </div>
          </div>

          {/* Requested products */}
          {Array.isArray(req.items) && (req.items as any[]).length > 0 && (
            <div className="card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-indigo-400" />
                <h2 className="font-semibold text-slate-200 text-sm">
                  Gewünschte Produkte ({(req.items as any[]).length})
                </h2>
              </div>
              <div className="divide-y divide-slate-700/30">
                {(req.items as any[]).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-500 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium">{item.productName}</p>
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-0.5 italic">{item.notes}</p>
                      )}
                    </div>
                    <span className="badge badge-neutral flex-shrink-0">× {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal admin notes (read-only display) */}
          {req.adminNotes && (
            <div className="card p-5 space-y-2"
              style={{ background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.12)" }}>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Interne Notiz</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{req.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Right: status form + user link */}
        <div className="space-y-4">
          <B2BStatusForm
            requestId={req.id}
            currentStatus={req.status}
            currentAdminNotes={req.adminNotes ?? ""}
          />

          {/* Linked user account */}
          {req.user && (
            <div className="card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User size={13} className="text-slate-500" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Verknüpfter Account</p>
              </div>
              <p className="text-sm text-slate-300">{req.user.name ?? req.user.email}</p>
              <p className="text-xs text-slate-500">{req.user.email}</p>
            </div>
          )}

          {/* Quick contact */}
          <div className="card p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Kontakt</p>
            <a href={`mailto:${req.email}?subject=Ihre B2B-Anfrage bei Envetra`}
              className="btn-primary w-full text-sm justify-center">
              <Mail size={14} /> E-Mail senden
            </a>
            {req.phone && (
              <a href={`tel:${req.phone}`} className="btn-secondary w-full text-sm justify-center">
                <Phone size={14} /> Anrufen
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
