// app/(admin)/admin/suppliers/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Truck, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lieferanten | Envetra Admin" };

export default async function SuppliersPage() {
  await requireAdmin();

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { purchaseOrders: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Lieferanten</h1>
          <p className="text-slate-500 text-sm mt-1">{suppliers.length} Lieferanten</p>
        </div>
        <Link href="/admin/suppliers/new" className="btn-primary">
          <Plus size={15} /> Neuer Lieferant
        </Link>
      </div>

      {suppliers.length === 0 ? (
        <div className="card p-12 text-center">
          <Truck size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">Noch keine Lieferanten angelegt</p>
          <Link href="/admin/suppliers/new" className="btn-primary inline-flex mt-4">
            <Plus size={14} /> Lieferant anlegen
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                {["Name", "Kontakt", "E-Mail", "Bestellungen", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-4 py-3.5 font-semibold text-slate-200">{s.name}</td>
                  <td className="px-4 py-3.5 text-slate-400">{s.contactName ?? "–"}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{s.email ?? "–"}</td>
                  <td className="px-4 py-3.5 text-slate-400">{s._count.purchaseOrders}</td>
                  <td className="px-4 py-3.5">
                    <span className={`badge ${s.isActive ? "badge-success" : "badge-neutral"}`}>
                      {s.isActive ? "Aktiv" : "Inaktiv"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/suppliers/${s.id}`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 flex items-center">
                      <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
