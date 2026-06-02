// app/(admin)/admin/products/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  ImageIcon,
} from "lucide-react";
import { ProductRowActions } from "./RowActions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Produkte | Envetra Admin" };

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; status?: string; success?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { q, category, status, success } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true, slug: true } } },
      where: {
        ...(q && {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        }),
        ...(category && { category: { slug: category } }),
        ...(status === "active"   && { isActive: true }),
        ...(status === "inactive" && { isActive: false }),
        ...(status === "featured" && { isFeatured: true }),
        ...(status === "lowstock" && { stock: { lte: 5 } }),
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const lowStockCount  = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {success === "created" && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-950/50 border border-green-500/30 text-green-400 text-sm animate-fade-in">
          <CheckCircle2 size={15} /> Produkt wurde erfolgreich erstellt.
        </div>
      )}
      {success === "updated" && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-950/50 border border-green-500/30 text-green-400 text-sm animate-fade-in">
          <CheckCircle2 size={15} /> Produkt wurde erfolgreich aktualisiert.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Produkte</h1>
          <p className="text-slate-500 text-sm mt-1">
            {products.length} Produkte
            {lowStockCount > 0 && <span className="ml-2 text-yellow-400">· {lowStockCount} niedriger Bestand</span>}
            {outOfStockCount > 0 && <span className="ml-2 text-red-400">· {outOfStockCount} ausverkauft</span>}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/products/media" className="btn-secondary whitespace-nowrap text-sm">
            <ImageIcon size={14} /> Bilder importieren
          </Link>
          <Link href="/admin/products/new" className="btn-primary whitespace-nowrap">
            <Plus size={15} /> Neues Produkt
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" action="/admin/products" className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Name, Marke oder SKU…"
              className="input pl-9 w-full"
              autoComplete="off"
            />
          </div>
          {category && <input type="hidden" name="category" value={category} />}
          {status   && <input type="hidden" name="status"   value={status} />}
          <button type="submit" className="btn-secondary px-3 whitespace-nowrap">Suchen</button>
          {q && (
            <Link
              href={`/admin/products?${new URLSearchParams({ ...(category ? { category } : {}), ...(status ? { status } : {}) })}`}
              className="btn-secondary px-3 text-slate-400"
            >✕</Link>
          )}
        </form>

        {/* Category filter — no onChange handler, uses form submit */}
        <form method="GET" action="/admin/products" className="flex gap-2">
          {q      && <input type="hidden" name="q"      value={q} />}
          {status && <input type="hidden" name="status" value={status} />}
          <select name="category" defaultValue={category ?? ""} className="input text-sm">
            <option value="">Alle Kategorien</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary px-3 text-sm">OK</button>
        </form>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { label: "Alle",              value: "" },
          { label: "Aktiv",             value: "active" },
          { label: "Inaktiv",           value: "inactive" },
          { label: "Featured",          value: "featured" },
          { label: "⚠ Niedriger Bestand", value: "lowstock" },
        ].map(({ label, value }) => {
          const active = (status ?? "") === value;
          const params = new URLSearchParams();
          if (q)        params.set("q",        q);
          if (category) params.set("category", category);
          if (value)    params.set("status",   value);
          return (
            <Link
              key={value}
              href={`/admin/products?${params}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/40">
                {["Produkt", "Kategorie", "Preis", "Bestand", "Status", "Aktionen"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">

                  {/* Product + thumbnail — FIX: next/image instead of <img onError> */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-700/40 relative">
                        {p.images[0] ? (
                          <Image
                            src={p.images[0]}
                            alt=""
                            fill
                            className="object-contain p-0.5"
                            sizes="40px"
                            unoptimized={p.images[0].startsWith("http")}
                          />
                        ) : (
                          <Package size={14} className="text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-200 truncate max-w-[180px]">{p.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {p.brand}
                          {p.sku && <span className="ml-2 text-slate-600">#{p.sku}</span>}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-slate-400 text-sm">{p.category.name}</td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="font-semibold text-slate-200">{fmt(Number(p.price))}</span>
                    {p.comparePrice && (
                      <span className="ml-2 text-xs text-slate-500 line-through">{fmt(Number(p.comparePrice))}</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`badge ${p.stock === 0 ? "badge-danger" : p.stock <= 5 ? "badge-warning" : "badge-success"}`}>
                        {p.stock === 0 ? "Leer" : `${p.stock} Stk.`}
                      </span>
                      {p.stock > 0 && p.stock <= 5 && <AlertTriangle size={11} className="text-yellow-400" />}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`badge ${p.isActive ? "badge-success" : "badge-neutral"}`}>
                        {p.isActive ? "Aktiv" : "Inaktiv"}
                      </span>
                      {p.isFeatured && <span className="badge badge-info">★ Featured</span>}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil size={13} />
                      </Link>
                      <ProductRowActions
                        productId={p.id}
                        productSlug={p.slug}
                        isActive={p.isActive}
                        isFeatured={p.isFeatured}
                      />
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Package size={40} className="mx-auto mb-4 text-slate-700" />
                    <p className="text-slate-400 font-medium text-base">Keine Produkte gefunden</p>
                    <p className="text-slate-500 text-sm mt-1">
                      {(q || category || status)
                        ? "Passe deine Filter an oder setze sie zurück."
                        : "Erstelle dein erstes Produkt um loszulegen."}
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-5">
                      {(q || category || status) && (
                        <Link href="/admin/products" className="btn-secondary text-sm">Filter zurücksetzen</Link>
                      )}
                      <Link href="/admin/products/new" className="btn-primary text-sm">
                        <Plus size={13} /> Neues Produkt
                      </Link>
                    </div>
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
