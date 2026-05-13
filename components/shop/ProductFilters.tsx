"use client";

// components/shop/ProductFilters.tsx — IT-shop style

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  brands: string[];
  currentFilters: {
    category?: string; brand?: string;
    minPrice?: number; maxPrice?: number; inStock?: boolean; sortBy: string;
  };
}

export function ProductFilters({ categories, brands, currentFilters }: Props) {
  const router      = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback((key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(key); else params.set(key, value);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }, [router, searchParams]);

  const hasActive = currentFilters.category || currentFilters.brand ||
    currentFilters.minPrice || currentFilters.maxPrice || currentFilters.inStock;

  return (
    <div className="space-y-5">
      {hasActive && (
        <button
          onClick={() => router.push("/products")}
          className="flex items-center gap-1.5 text-xs text-[#1a56db] hover:underline font-semibold"
        >
          <X size={12} /> Alle Filter löschen
        </button>
      )}

      {/* Kategorie */}
      <FilterSection title="Kategorie">
        <ul className="space-y-0.5">
          <li>
            <button
              onClick={() => update("category", undefined)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-sm transition-colors ${
                !currentFilters.category ? "bg-[#eff4ff] text-[#1a56db] font-semibold" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Alle Kategorien
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => update("category", currentFilters.category === cat.slug ? undefined : cat.slug)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-sm transition-colors ${
                  currentFilters.category === cat.slug
                    ? "bg-[#eff4ff] text-[#1a56db] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Marke */}
      {brands.length > 0 && (
        <FilterSection title="Marke">
          <ul className="space-y-0.5 max-h-52 overflow-y-auto">
            {brands.map((brand) => (
              <li key={brand}>
                <button
                  onClick={() => update("brand", currentFilters.brand === brand ? undefined : brand)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-sm transition-colors flex items-center gap-2 ${
                    currentFilters.brand === brand
                      ? "bg-[#eff4ff] text-[#1a56db] font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 border rounded-sm flex-shrink-0 flex items-center justify-center text-[9px] ${
                    currentFilters.brand === brand ? "bg-[#1a56db] border-[#1a56db] text-white" : "border-gray-300"
                  }`}>
                    {currentFilters.brand === brand && "✓"}
                  </span>
                  {brand}
                </button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Preis */}
      <FilterSection title="Preis">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={0}
            placeholder="Von €"
            defaultValue={currentFilters.minPrice}
            onBlur={(e) => update("minPrice", e.target.value || undefined)}
            className="input text-sm py-1.5 w-20"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="number"
            min={0}
            placeholder="Bis €"
            defaultValue={currentFilters.maxPrice}
            onBlur={(e) => update("maxPrice", e.target.value || undefined)}
            className="input text-sm py-1.5 w-20"
          />
        </div>
      </FilterSection>

      {/* Verfügbarkeit */}
      <FilterSection title="Verfügbarkeit">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!currentFilters.inStock}
            onChange={(e) => update("inStock", e.target.checked ? "true" : undefined)}
            className="w-3.5 h-3.5 accent-[#1a56db]"
          />
          <span className="text-sm text-gray-700">Nur lagernde Artikel</span>
        </label>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#e8eaed] pb-5">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}
