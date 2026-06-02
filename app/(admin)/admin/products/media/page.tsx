// app/(admin)/admin/products/media/page.tsx

import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, ImageIcon, FileText } from "lucide-react";
import type { Metadata } from "next";
import { BulkImageImportClient } from "./BulkImageImportClient";

export const metadata: Metadata = {
  title: "Produktbilder verwalten | Envetra Admin",
};

export default async function MediaManagementPage() {
  await requireAdmin();

  return (
    <div className="space-y-6 pb-8">
      <Link
        href="/admin/products"
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ChevronLeft size={15} /> Zurück zu Produkten
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
          <ImageIcon size={22} className="text-indigo-400" />
          Produktbilder verwalten
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Bilder per CSV-Import massenweise importieren. Einzelne Bilder über die
          Produktbearbeitungsseite verwalten.
        </p>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/admin/products"
          className="btn-secondary text-sm flex items-center gap-2"
        >
          <FileText size={14} /> Alle Produkte
        </Link>
        <Link
          href="/admin/products/new"
          className="btn-secondary text-sm flex items-center gap-2"
        >
          Neues Produkt mit Bildern
        </Link>
      </div>

      {/* Bulk CSV import */}
      <BulkImageImportClient />
    </div>
  );
}
