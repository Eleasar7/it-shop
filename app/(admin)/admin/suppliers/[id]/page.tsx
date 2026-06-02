// app/(admin)/admin/suppliers/[id]/page.tsx

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { SupplierForm } from "./SupplierForm";
import { updateSupplier } from "@/app/actions/suppliers";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }
export const metadata: Metadata = { title: "Lieferant | Envetra Admin" };

export default async function SupplierDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchaseOrders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { _count: { select: { items: true } } },
      },
    },
  });
  if (!supplier) notFound();

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const boundUpdate = updateSupplier.bind(null, id);

  return (
    <div className="space-y-6 pb-8">
      <Link href="/admin/suppliers" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ChevronLeft size={15} /> Lieferanten
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">{supplier.name}</h1>
        <Link href="/admin/purchase-orders/new" className="btn-secondary text-sm">
          <Plus size={14} /> Bestellung erstellen
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SupplierForm action={boundUpdate} initialData={supplier} submitLabel="Speichern" />

        {supplier.purchaseOrders.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/50">
              <h2 className="font-semibold text-slate-200 text-sm">Bestellungen</h2>
            </div>
            <div className="divide-y divide-slate-700/30">
              {supplier.purchaseOrders.map((po) => (
                <Link key={po.id} href={`/admin/purchase-orders/${po.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/40 transition-colors">
                  <div>
                    <p className="text-sm font-mono text-slate-300">#{po.poNumber.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{po._count.items} Positionen · {new Date(po.createdAt).toLocaleDateString("de-DE")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="po" value={po.status} />
                    <span className="text-sm font-semibold text-slate-200 tabular-nums">{fmt(Number(po.totalAmount))}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
