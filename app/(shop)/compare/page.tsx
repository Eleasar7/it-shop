"use client";

// app/(shop)/compare/page.tsx
// Product comparison page — reads from Zustand compare store.

import { useCompareStore } from "@/store/compare";
import { useCartStore } from "@/store/cart";
import Image from "next/image";
import Link from "next/link";
import {
  Package, ShoppingCart, X, ArrowLeft, GitCompare,
} from "lucide-react";
import { useState } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="badge badge-danger">Ausverkauft</span>;
  if (stock <= 5) return <span className="badge badge-warning">Nur noch {stock}</span>;
  return <span className="badge badge-success">Auf Lager</span>;
}

export default function ComparePage() {
  const { items, remove, clear } = useCompareStore();
  const addToCart = useCartStore((s) => s.addItem);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAddToCart = (product: typeof items[0]) => {
    addToCart(product);
    setAddedIds((s) => new Set([...s, product.id]));
    setTimeout(() => setAddedIds((s) => { const n = new Set(s); n.delete(product.id); return n; }), 2000);
  };

  // Collect all spec keys across all products
  const allSpecKeys = Array.from(
    new Set(
      items.flatMap((p) =>
        Object.keys((p.specs as Record<string, unknown>) ?? {}).filter((k) => k.trim())
      )
    )
  );

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto bg-white border border-[#e8eaed]">
          <GitCompare size={36} className="text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-100 mb-2">Kein Vergleich aktiv</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Wähle bis zu 4 Produkte aus dem Shop aus, um sie hier zu vergleichen.
            Klicke auf den „Vergleichen"-Button auf einer Produktkarte.
          </p>
        </div>
        <Link href="/products" className="btn-primary inline-flex">
          <ArrowLeft size={15} /> Zum Shop
        </Link>
      </div>
    );
  }

  const BASE_ROWS = [
    { key: "brand", label: "Marke", render: (p: typeof items[0]) => p.brand },
    { key: "category", label: "Kategorie", render: (p: typeof items[0]) => p.category.name },
    { key: "price", label: "Preis", render: (p: typeof items[0]) => (
      <div className="space-y-0.5">
        <span className="text-base font-black text-slate-50 tabular-nums">{fmt(p.price)}</span>
        {p.comparePrice && (
          <div className="text-xs text-slate-600 line-through tabular-nums">{fmt(p.comparePrice)}</div>
        )}
      </div>
    )},
    { key: "stock", label: "Verfügbarkeit", render: (p: typeof items[0]) => <StockBadge stock={p.stock} /> },
    { key: "sku", label: "Artikelnummer", render: (p: typeof items[0]) => (
      <span className="font-mono text-xs text-slate-500">{p.sku ?? "–"}</span>
    )},
    ...(items.some((p) => p.weight) ? [{
      key: "weight",
      label: "Gewicht",
      render: (p: typeof items[0]) => p.weight ? `${p.weight} g` : "–",
    }] : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/products"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-200 transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-50">Produktvergleich</h1>
            <p className="text-slate-500 text-sm">{items.length} von 4 Produkten ausgewählt</p>
          </div>
        </div>
        <button onClick={clear} className="btn-secondary text-sm">
          <X size={14} /> Vergleich leeren
        </button>
      </div>

      {/* Comparison table — horizontal scroll on mobile */}
      <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full min-w-[640px]" style={{ background: "rgb(var(--bg-elevated))" }}>
          <colgroup>
            <col style={{ width: "160px" }} />
            {items.map((p) => <col key={p.id} style={{ width: `${100 / items.length}%` }} />)}
          </colgroup>

          {/* Product header row */}
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <th className="px-4 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-widest"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                Produkt
              </th>
              {items.map((product) => (
                <th key={product.id} className="px-4 py-4 text-left align-top">
                  <div className="space-y-3">
                    {/* Image */}
                    <div className="relative aspect-square w-full max-w-[140px] rounded-xl overflow-hidden"
                      style={{ background: "rgb(var(--bg-panel))", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {product.images[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-contain p-3" sizes="140px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={28} className="text-slate-700" />
                        </div>
                      )}
                    </div>
                    {/* Name */}
                    <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-0.5">{product.brand}</p>
                      <Link href={`/products/${product.slug}`}
                        className="text-sm font-bold text-slate-200 hover:text-white transition-colors leading-snug line-clamp-3 block">
                        {product.name}
                      </Link>
                    </div>
                    {/* Actions */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`btn-primary text-xs py-2 justify-center w-full ${
                          addedIds.has(product.id) ? "!bg-green-600" : ""
                        }`}
                      >
                        {addedIds.has(product.id) ? "✓ Hinzugefügt" : <><ShoppingCart size={12} /> In den Warenkorb</>}
                      </button>
                      <button
                        onClick={() => remove(product.id)}
                        className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-red-400 transition-colors justify-center"
                      >
                        <X size={11} /> Entfernen
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Base attribute rows */}
            {BASE_ROWS.map((row, rowIdx) => (
              <tr key={row.key}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: rowIdx % 2 === 0 ? "rgba(255,255,255,0.012)" : "transparent",
                }}>
                <td className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  {row.label}
                </td>
                {items.map((product) => (
                  <td key={product.id} className="px-4 py-3.5 text-sm text-slate-300">
                    {row.render(product)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Specs section header */}
            {allSpecKeys.length > 0 && (
              <tr style={{ background: "rgba(99,102,241,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <td colSpan={items.length + 1}
                  className="px-4 py-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Technische Daten
                </td>
              </tr>
            )}

            {/* Spec rows */}
            {allSpecKeys.map((key, idx) => {
              // Get all values for this key
              const values = items.map((p) => {
                const s = (p.specs as Record<string, unknown>) ?? {};
                return s[key] !== undefined ? String(s[key]) : null;
              });

              // Check if all same
              const allSame = values.every((v) => v === values[0]);

              return (
                <tr key={key} style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: idx % 2 === 0 ? "rgba(255,255,255,0.012)" : "transparent",
                }}>
                  <td className="px-4 py-3.5 text-xs font-bold text-slate-500 capitalize"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    {key.replace(/[_-]+/g, " ")}
                  </td>
                  {values.map((val, vi) => (
                    <td key={vi} className={`px-4 py-3.5 text-sm ${
                      val === null ? "text-slate-700" :
                      !allSame && val !== values[0] ? "text-slate-200 font-semibold" :
                      "text-slate-300"
                    }`}>
                      {val ?? <span className="text-slate-700">–</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CTA: go back to shopping */}
      <div className="mt-8 text-center">
        <Link href="/products" className="btn-secondary gap-1.5">
          <ArrowLeft size={14} /> Weitere Produkte durchsuchen
        </Link>
      </div>
    </div>
  );
}
