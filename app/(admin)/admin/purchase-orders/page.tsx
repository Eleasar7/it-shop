// app/(admin)/admin/purchase-orders/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ShoppingCart, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bestellungen | Envetra Admin" };

export default async function PurchaseOrdersPage() {
  await requireAdmin();

  const orders = await prisma.purchaseOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { name: true } },
      _count:   { select: { items: true } },
    },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Einkaufsbestellungen</h1>
          <p className="text-slate-500 text-sm mt-1">{orders.length} Bestellungen</p>
        </div>
        <Link href="/admin/purchase-orders/new" className="btn-primary">
          <Plus size={15} /> Neue Bestellung
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingCart size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400">Noch keine Einkaufsbestellungen</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                {["#", "Lieferant", "Positionen", "Betrag", "Status", "Erwartet", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-400">#{po.poNumber.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-200">{po.supplier.name}</td>
                  <td className="px-4 py-3.5 text-slate-400">{po._count.items}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-200 tabular-nums">{fmt(Number(po.totalAmount))}</td>
                  <td className="px-4 py-3.5"><StatusBadge type="po" value={po.status} /></td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">
                    {po.expectedAt ? new Date(po.expectedAt).toLocaleDateString("de-DE") : "–"}
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/purchase-orders/${po.id}`}
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
