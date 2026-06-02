// app/(admin)/admin/products/new/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Neues Produkt | Envetra Admin" };

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronLeft size={15} /> Zurück zu Produkten
        </Link>
        <div className="card p-10 text-center space-y-4">
          <p className="text-slate-300 font-medium">Keine Kategorien vorhanden</p>
          <p className="text-slate-500 text-sm">
            Führe zunächst <code className="text-indigo-400">npx prisma db seed</code> aus,
            um Kategorien zu erstellen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4">
          <ChevronLeft size={15} /> Zurück zu Produkten
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Neues Produkt erstellen</h1>
        <p className="text-slate-500 text-sm mt-1">Alle Pflichtfelder ausfüllen und speichern</p>
      </div>

      <ProductForm categories={categories as any} />
    </div>
  );
}
