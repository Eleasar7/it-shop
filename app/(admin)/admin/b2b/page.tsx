// app/(admin)/admin/b2b/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Building2, ChevronRight, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "B2B-Anfragen | Envetra Admin" };

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  OPEN:      { label: "Neu",            badge: "badge-warning" },
  IN_REVIEW: { label: "In Prüfung",     badge: "badge-info" },
  QUOTED:    { label: "Angebot sent.",  badge: "badge-info" },
  ACCEPTED:  { label: "Gewonnen",       badge: "badge-success" },
  REJECTED:  { label: "Abgelehnt",      badge: "badge-danger" },
  CLOSED:    { label: "Geschlossen",    badge: "badge-neutral" },
};

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminB2BPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { status, q } = await searchParams;

  const requests = await prisma.b2BRequest.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      ...(status && { status: status as any }),
      ...(q && {
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { contactName: { contains: q, mode: "insensitive" } },
          { email:       { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    include: { user: { select: { email: true, name: true } } },
  });

  const openCount = await prisma.b2BRequest.count({
    where: { status: { in: ["OPEN", "IN_REVIEW"] } },
  });

  const STATUS_FILTERS = [
    { label: "Alle",       value: "" },
    { label: "Neu",        value: "OPEN" },
    { label: "In Prüfung", value: "IN_REVIEW" },
    { label: "Angebot",    value: "QUOTED" },
    { label: "Gewonnen",   value: "ACCEPTED" },
    { label: "Abgelehnt",  value: "REJECTED" },
    { label: "Geschlossen",value: "CLOSED" },
  ];

  function buildHref(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q)      params.set("q", q);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    return `/admin/b2b?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">B2B-Anfragen</h1>
          <p className="text-slate-500 text-sm mt-1">
            {requests.length} Anfragen
            {openCount > 0 && (
              <span className="ml-2 text-amber-400">· {openCount} offen</span>
            )}
          </p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/b2b" className="flex gap-2 max-w-md">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Firma, Kontakt oder E-Mail…"
            className="input text-sm pl-9 w-full"
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn-secondary px-3 text-sm">Suchen</button>
        {q && (
          <Link href={buildHref({ q: "" })} className="btn-secondary px-3 text-slate-500 text-sm">✕</Link>
        )}
      </form>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => {
          const active = (status ?? "") === value;
          return (
            <Link key={value} href={buildHref({ status: value })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">Keine B2B-Anfragen gefunden</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-700/50 bg-slate-800/40">
                  {["Unternehmen", "Kontakt", "E-Mail", "Produkte", "Status", "Datum", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {requests.map((req) => {
                  const cfg = STATUS_CONFIG[req.status];
                  const itemCount = Array.isArray(req.items) ? (req.items as any[]).length : 0;
                  return (
                    <tr key={req.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-4 py-3.5 font-semibold text-slate-200 max-w-[140px] truncate">
                        {req.companyName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 max-w-[120px] truncate">
                        {req.contactName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs max-w-[160px] truncate">
                        {req.email}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">
                        {itemCount > 0 ? `${itemCount} Pos.` : "–"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`badge ${cfg?.badge ?? "badge-neutral"}`}>
                          {cfg?.label ?? req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString("de-DE")}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/admin/b2b/${req.id}`}
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
