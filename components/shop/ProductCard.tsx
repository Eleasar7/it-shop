"use client";

// components/shop/ProductCard.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Package, Check, GitCompare, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useCompareStore } from "@/store/compare";
import type { Product } from "@/types";
import { getCategoryFallback } from "@/lib/images";

interface ProductCardProps {
  product: Product;
  showCompare?: boolean;
}

export function ProductCard({ product, showCompare = true }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const { add: addToCompare, remove: removeFromCompare, isSelected } = useCompareStore();

  const [added,      setAdded]      = useState(false);
  const [imgError,   setImgError]   = useState(false);
  const [hoverImage, setHoverImage] = useState(false);
  const selected = isSelected(product.id);

  const primaryImage   = product.images[0] ?? getCategoryFallback(product.category?.slug);
  const secondaryImage = product.images[1] ?? null;

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : null;

  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || added) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) removeFromCompare(product.id);
    else addToCompare(product);
  };

  return (
    <div className="product-card group flex flex-col bg-white">

      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="block"
        onMouseEnter={() => setHoverImage(true)}
        onMouseLeave={() => setHoverImage(false)}
      >
        <div className="relative bg-[#f8f9fa] overflow-hidden" style={{ paddingTop: "75%" }}>
          {/* Badges */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {discount && (
              <span className="bg-[#c5221f] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                -{discount}%
              </span>
            )}
            {product.isFeatured && !discount && (
              <span className="bg-[#1a56db] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Star size={7} className="fill-white" /> Top
              </span>
            )}
          </div>

          {!imgError && primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className={`object-contain p-3 transition-all duration-300 ${
                  secondaryImage && hoverImage ? "opacity-0" : "opacity-100 group-hover:scale-[1.03]"
                }`}
                sizes="(max-width: 640px) 50vw, 25vw"
                onError={() => setImgError(true)}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={`${product.name} – Bild 2`}
                  fill
                  className={`object-contain p-3 transition-all duration-300 ${
                    hoverImage ? "opacity-100 scale-[1.02]" : "opacity-0"
                  }`}
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package size={36} className="text-gray-200" />
            </div>
          )}

          {product.images.length > 1 && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {product.images.slice(0, Math.min(5, product.images.length)).map((_, i) => (
                <span key={i} className={`w-1 h-1 rounded-full ${i === (hoverImage && secondaryImage ? 1 : 0) ? "bg-[#1a56db]" : "bg-gray-300"}`} />
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1">
        {/* Brand */}
        <p className="text-[10px] font-extrabold text-[#1a56db] uppercase tracking-wide">
          {product.brand}
        </p>

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-[11px] sm:text-xs font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-[#1a56db] transition-colors min-h-[2.4rem]">
            {product.name}
          </h3>
        </Link>

        {/* SKU */}
        {product.sku && (
          <p className="text-[9px] text-gray-400 font-mono hidden sm:block">Art.: {product.sku}</p>
        )}

        {/* Stock */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            isOutOfStock ? "bg-gray-300" : isLowStock ? "bg-amber-400" : "bg-green-500"
          }`} />
          <span className={`text-[10px] font-medium ${
            isOutOfStock ? "text-gray-400" : isLowStock ? "text-amber-600" : "text-green-700"
          }`}>
            {isOutOfStock
              ? "Nicht verfügbar"
              : isLowStock
              ? `Nur ${product.stock} Stk.`
              : "Auf Lager"}
          </span>
          {!isOutOfStock && (
            <span className="text-[9px] text-gray-400 ml-auto hidden sm:block">1–2 Tage</span>
          )}
        </div>

        <div className="flex-1" />

        {/* Compare — desktop only to save space on mobile */}
        {showCompare && (
          <button
            onClick={handleCompare}
            className={`hidden sm:flex items-center gap-1 text-[10px] transition-colors w-fit mt-0.5 ${
              selected ? "text-[#1a56db] font-semibold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <GitCompare size={10} />
            {selected ? "Ausgewählt" : "Vergleichen"}
          </button>
        )}

        {/* Price */}
        <div className="mt-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold text-gray-900 tabular-nums">
              {fmt(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-[11px] text-gray-400 line-through tabular-nums">
                {fmt(product.comparePrice)}
              </span>
            )}
          </div>
          <p className="text-[9px] text-gray-400">inkl. MwSt.</p>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-1.5 w-full flex items-center justify-center gap-1.5 py-2.5 sm:py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] ${
            added
              ? "bg-green-600 text-white"
              : isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-[#1a56db] hover:bg-[#1043b2] text-white active:scale-[.98]"
          }`}
        >
          {added
            ? <><Check size={13} /> Hinzugefügt</>
            : isOutOfStock
            ? "Nicht verfügbar"
            : <><ShoppingCart size={13} /> <span className="hidden sm:inline">In den Warenkorb</span><span className="sm:hidden">Kaufen</span></>
          }
        </button>
      </div>
    </div>
  );
}
