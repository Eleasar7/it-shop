// app/(admin)/admin/customers/page.tsx

import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kunden | TechCore Admin" };

export default async function AdminCustomersPage() {
  await requireAdmin();

  const customers = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: {
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true },
      },
    },
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Kunden</h1>
        <p className="text-slate-500 text-sm mt-1">{customers.length} registrierte Kunden</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                {["Kunde", "E-Mail", "Bestellungen", "Gesamtumsatz", "Mitglied seit"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce((s, o) => s + Number(o.totalAmount), 0);
                return (
                  <tr key={customer.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
                          {(customer.name ?? customer.email)[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200 truncate max-w-[140px]">
                          {customer.name ?? "–"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 truncate max-w-[180px]">{customer.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="badge badge-neutral">{customer._count.orders}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-200 tabular-nums">
                      {totalSpent > 0 ? fmt(totalSpent) : <span className="text-slate-500">–</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">
                      {new Date(customer.createdAt).toLocaleDateString("de-DE")}
                    </td>
                      <td className="px-4 py-3.5">
                      <Link href={`/admin/customers/${customer.id}`}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100 flex items-center">
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <Users size={36} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400">Noch keine Kunden registriert</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
