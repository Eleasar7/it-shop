"use client";

// app/(shop)/products/[slug]/ProductDetailClient.tsx

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart, Package, ChevronRight, Minus, Plus,
  Shield, Truck, RotateCcw, Check, GitCompare,
  FileText, Phone, ZoomIn, X, ChevronLeft, ChevronDown,
  CreditCard, Building2, Star, Clock,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useCompareStore } from "@/store/compare";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/types";
import { getProductMainImage, getCategoryFallback } from "@/lib/images";

interface Props { product: Product; relatedProducts: Product[]; }

type Tab = "description" | "specs" | "shipping" | "warranty";

// ─── Spec grouping logic ──────────────────────────────────────────────────────
// Groups known spec keys into sections. Unknown keys go into "Weitere Daten".

const SPEC_GROUPS: Array<{ label: string; keys: string[] }> = [
  { label: "Prozessor", keys: ["cpu","prozessor","chip","processor","takt","kerne","threads","cache","tdp","sockel"] },
  { label: "Arbeitsspeicher", keys: ["ram","arbeitsspeicher","speicher","memory","ddr","speichertyp","speichergeschwindigkeit","slots"] },
  { label: "Grafik", keys: ["gpu","grafik","grafikkarte","vram","videospeicher","displayport","hdmi","dvi","graphics"] },
  { label: "Speicher", keys: ["ssd","hdd","nvme","festplatte","storage","kapazität","capacity","m.2","sata"] },
  { label: "Display", keys: ["display","bildschirm","auflösung","resolution","panel","helligkeit","brightness","hz","refresh","touch","größe","zoll","inch"] },
  { label: "Anschlüsse", keys: ["usb","thunderbolt","anschluss","port","bluetooth","wifi","wlan","netzwerk","ethernet","rj45","lan"] },
  { label: "Akku & Energie", keys: ["akku","battery","wh","watt","netzteil","stromversorgung","laufzeit"] },
  { label: "Abmessungen & Gewicht", keys: ["gewicht","weight","abmessungen","maße","dimensions","höhe","breite","tiefe","rack","formfaktor"] },
  { label: "Betriebssystem", keys: ["betriebssystem","os","windows","linux","macos","android","ios"] },
  { label: "Zertifizierungen", keys: ["zertifizierung","militär","ip","schutz","certification","norm","mil","energiestern"] },
];

function groupSpecs(entries: Array<[string, string]>): Array<{ label: string; items: Array<[string, string]> }> {
  const assigned = new Set<string>();
  const groups: Array<{ label: string; items: Array<[string, string]> }> = [];

  for (const group of SPEC_GROUPS) {
    const items = entries.filter(([k]) => {
      const kLower = k.toLowerCase();
      return group.keys.some((gk) => kLower.includes(gk)) && !assigned.has(k);
    });
    if (items.length > 0) {
      items.forEach(([k]) => assigned.add(k));
      groups.push({ label: group.label, items });
    }
  }

  const rest = entries.filter(([k]) => !assigned.has(k));
  if (rest.length > 0) groups.push({ label: "Weitere Daten", items: rest });

  return groups;
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const [activeImage,  setActiveImage]  = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity,     setQuantity]     = useState(1);
  const [added,        setAdded]        = useState(false);
  const [activeTab,    setActiveTab]    = useState<Tab>("description");
  const [imgError,     setImgError]     = useState(false);
  const [specsExpanded,setSpecsExpanded]= useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { add: addCompare, remove: removeCompare, isSelected } = useCompareStore();
  const inCompare = isSelected(product.id);

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock   = product.stock > 0 && product.stock <= 5;

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100) : null;

  const savings = product.comparePrice && product.comparePrice > product.price
    ? product.comparePrice - product.price : null;

  const specs = product.specs as Record<string, string | number | boolean>;
  const specEntries: Array<[string, string]> = Object.entries(specs ?? {})
    .filter(([k, v]) => k && String(v).trim())
    .map(([k, v]) => [k, String(v)]);

  const specGroups = groupSpecs(specEntries);
  const allSpecsShown = specGroups.flatMap(g => g.items);
  const SPEC_PREVIEW_COUNT = 8;
  const showExpandSpecs = allSpecsShown.length > SPEC_PREVIEW_COUNT;

  // Use category fallback when product has no images
  const categorySlug = product.category?.slug;
  const hasFallback = product.images.length === 0;
  const images = product.images.length > 0
    ? product.images
    : [getCategoryFallback(categorySlug)];

  // Lightbox keyboard nav
  useEffect(() => {
    if (!lightboxOpen) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")     setLightboxOpen(false);
      if (e.key === "ArrowRight") setActiveImage((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")  setActiveImage((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [lightboxOpen, images.length]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "description", label: "Produktbeschreibung" },
    { key: "specs",       label: "Technische Daten" },
    { key: "shipping",    label: "Versand & Lieferung" },
    { key: "warranty",    label: "Garantie & Service" },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 lg:pb-0">

      {/* ── Lightbox ── */}
      {lightboxOpen && images.length > 0 && !hasFallback && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-[fadeIn_.15s_ease]"
          onClick={() => setLightboxOpen(false)}>
          {/* Close */}
          <button onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
            <X size={22} />
          </button>
          {/* Prev */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + images.length) % images.length); }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % images.length); }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10">
                <ChevronRight size={22} />
              </button>
            </>
          )}
          {/* Image */}
          <div className="relative w-full max-w-4xl max-h-[80vh]" style={{ height: "80vh" }} onClick={(e) => e.stopPropagation()}>
            <Image src={images[activeImage]} alt={`${product.name} – Bild ${activeImage + 1}`} fill
              className="object-contain" sizes="90vw" priority />
          </div>
          {/* Counter + dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            {images.length > 1 && (
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setActiveImage(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImage ? "bg-white w-4" : "bg-white/30 hover:bg-white/60"}`}
                  />
                ))}
              </div>
            )}
            <span className="text-white/50 text-xs">{activeImage + 1} / {images.length} · Esc zum Schließen</span>
          </div>
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/40 rounded-xl backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}>
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeImage ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                  }`}>
                  <div className="relative w-full h-full">
                    <Image src={src} alt="" fill className="object-contain bg-slate-900 p-0.5" sizes="48px" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="section py-2.5">
          <nav className="flex items-center gap-1 text-xs text-[#64748b] flex-wrap">
            <Link href="/" className="hover:text-[#1a56db] transition-colors">Start</Link>
            <ChevronRight size={10} className="text-gray-300" />
            <Link href="/products" className="hover:text-[#1a56db] transition-colors">Produkte</Link>
            <ChevronRight size={10} className="text-gray-300" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#1a56db] transition-colors">
              {product.category.name}
            </Link>
            <ChevronRight size={10} className="text-gray-300" />
            <span className="text-[#334155] truncate max-w-[180px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="section py-5">
        {/* ── MAIN TWO-COLUMN LAYOUT ── */}
        <div className="flex flex-col xl:flex-row gap-6">

          {/* ── LEFT: Gallery (vertical thumbnails) ── */}
          <div className="xl:w-[500px] flex-shrink-0">
            <div className="flex gap-3">
              {/* Vertical thumbnails (desktop) */}
              {images.length > 1 && (
                <div className="hidden sm:flex flex-col gap-1.5 w-16">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-16 h-16 flex-shrink-0 border-2 rounded overflow-hidden transition-all ${
                        activeImage === i
                          ? "border-[#1a56db] shadow-sm"
                          : "border-[#e2e8f0] hover:border-[#93c5fd]"
                      }`}
                    >
                      <div className="relative w-full h-full bg-[#f8fafc]">
                        <Image src={src} alt={`Bild ${i + 1}`} fill className="object-contain p-1" sizes="64px" />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="flex-1 bg-white border border-[#e2e8f0] rounded-lg overflow-hidden xl:sticky xl:top-20">
                <div className="relative group" style={{ paddingTop: "80%" }}>
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    {discount && (
                      <span className="bg-[#c5221f] text-white text-xs font-bold px-2 py-0.5 rounded">
                        -{discount}% SPARE {savings ? fmt(savings) : ""}
                      </span>
                    )}
                    {product.isFeatured && !discount && (
                      <span className="bg-[#1a56db] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <Star size={9} className="fill-white" /> Bestseller
                      </span>
                    )}
                    {isLowStock && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Nur noch {product.stock} Stk.!
                      </span>
                    )}
                  </div>

                  {/* Zoom button */}
                  {images.length > 0 && !imgError && (
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 backdrop-blur-sm border border-[#e2e8f0] rounded text-gray-500 hover:text-[#1a56db] transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Bild vergrößern"
                    >
                      <ZoomIn size={16} />
                    </button>
                  )}

                  {images.length > 0 && !imgError ? (
                    <Image
                      src={images[activeImage]}
                      alt={product.name}
                      fill
                      className="object-contain p-6 cursor-zoom-in"
                      sizes="500px"
                      priority
                      onError={() => setImgError(true)}
                      onClick={() => setLightboxOpen(true)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package size={72} className="text-[#e2e8f0]" />
                    </div>
                  )}
                </div>

                {/* Mobile horizontal thumbnails */}
                {images.length > 1 && (
                  <div className="sm:hidden flex gap-1.5 p-2.5 border-t border-[#f1f5f9] overflow-x-auto scrollbar-hide">
                    {images.map((src, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`flex-shrink-0 w-12 h-12 border-2 rounded overflow-hidden transition-colors ${
                          activeImage === i ? "border-[#1a56db]" : "border-[#e2e8f0]"
                        }`}
                      >
                        <div className="relative w-full h-full bg-[#f8fafc]">
                          <Image src={src} alt={`Bild ${i + 1}`} fill className="object-contain p-1" sizes="48px" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="text-center py-2 text-[10px] text-[#94a3b8] font-medium border-t border-[#f1f5f9]">
                    Bild {activeImage + 1} von {images.length} · Klick zum Vergrößern
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Info + Buy Box ── */}
          <div className="flex-1 min-w-0 flex flex-col xl:flex-row gap-5">

            {/* Product info */}
            <div className="flex-1 min-w-0">
              {/* Brand + Name */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Link href={`/products?brand=${product.brand}`}
                    className="text-[11px] font-extrabold text-[#1a56db] uppercase tracking-wider hover:underline">
                    {product.brand}
                  </Link>
                  <span className="text-[#e2e8f0]">|</span>
                  <Link href={`/products?category=${product.category.slug}`}
                    className="text-[11px] text-[#64748b] hover:text-[#1a56db] transition-colors">
                    {product.category.name}
                  </Link>
                </div>

                <h1 className="text-[18px] font-extrabold text-[#0f172a] leading-snug mb-2">
                  {product.name}
                </h1>

                {/* SKU + meta */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#94a3b8]">
                  {product.sku && (
                    <span>Art.-Nr.: <span className="font-mono text-[#64748b] font-semibold">{product.sku}</span></span>
                  )}
                  {product.weight && (
                    <span>Gewicht: <span className="text-[#64748b]">{product.weight} g</span></span>
                  )}
                </div>

                {/* Stock status */}
                <div className={`flex items-center gap-2 mt-3 py-2 px-3 rounded text-sm font-semibold ${
                  isOutOfStock ? "bg-red-50 text-red-700" :
                  isLowStock  ? "bg-amber-50 text-amber-700" :
                  "bg-green-50 text-green-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-500" : "bg-green-500"
                  }`} />
                  <span>
                    {isOutOfStock ? "Derzeit nicht verfügbar" :
                     isLowStock   ? `Nur noch ${product.stock} Stück auf Lager – schnell bestellen!` :
                     "Auf Lager – Lieferzeit 1–2 Werktage"}
                  </span>
                  {!isOutOfStock && (
                    <span className="ml-auto flex items-center gap-1 text-[11px] font-medium opacity-75">
                      <Clock size={11} /> Werktags bis 14 Uhr: Versand heute
                    </span>
                  )}
                </div>
              </div>

              {/* Compact specs highlight */}
              {specEntries.length > 0 && (
                <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 mb-4">
                  <p className="text-[11px] font-black text-[#94a3b8] uppercase tracking-widest mb-2.5">Technische Kurzübersicht</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {(specsExpanded ? allSpecsShown : allSpecsShown.slice(0, SPEC_PREVIEW_COUNT)).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-xs">
                        <span className="text-[#94a3b8] shrink-0 min-w-[80px] max-w-[120px]">{key}</span>
                        <span className="font-semibold text-[#1e293b] leading-snug">{value}</span>
                      </div>
                    ))}
                  </div>
                  {showExpandSpecs && (
                    <button
                      onClick={() => setSpecsExpanded(!specsExpanded)}
                      className="flex items-center gap-1 mt-3 text-xs text-[#1a56db] font-semibold hover:underline"
                    >
                      <ChevronDown size={13} className={`transition-transform ${specsExpanded ? "rotate-180" : ""}`} />
                      {specsExpanded ? "Weniger anzeigen" : `${allSpecsShown.length - SPEC_PREVIEW_COUNT} weitere Eigenschaften einblenden`}
                    </button>
                  )}
                </div>
              )}

              {/* Description preview */}
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 mb-4">
                <p className="text-[11px] font-black text-[#94a3b8] uppercase tracking-widest mb-2">Beschreibung</p>
                <p className="text-sm text-[#475569] leading-relaxed line-clamp-5">{product.description}</p>
              </div>
            </div>

            {/* ── BUY BOX ── */}
            <div className="xl:w-[300px] flex-shrink-0">
              <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 space-y-4 xl:sticky xl:top-20">

                {/* Price block */}
                <div className="pb-4 border-b border-[#f1f5f9]">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-black text-[#0f172a] tabular-nums">
                      {fmt(product.price)}
                    </span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-[#94a3b8] line-through tabular-nums">
                        {fmt(product.comparePrice)}
                      </span>
                    )}
                  </div>

                  {/* Savings */}
                  {savings && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-bold text-white bg-[#c5221f] px-1.5 py-0.5 rounded">
                        -{discount}%
                      </span>
                      <span className="text-xs text-[#c5221f] font-semibold">
                        Sie sparen {fmt(savings)}
                      </span>
                    </div>
                  )}

                  {/* VAT + net */}
                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-[11px] text-[#64748b]">
                      inkl. 19% MwSt. · Netto: <span className="font-semibold">{fmt(product.price / 1.19)}</span>
                    </p>
                    <p className="text-[11px] text-[#64748b]">zzgl. Versandkosten</p>
                  </div>
                </div>

                {/* Qty selector */}
                {!isOutOfStock && (
                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1.5">Menge</label>
                    <div className="flex items-center w-fit border border-[#e2e8f0] rounded overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-30 transition-colors border-r border-[#e2e8f0]"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-[#0f172a]">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                        disabled={quantity >= product.stock}
                        className="w-9 h-9 flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] disabled:opacity-30 transition-colors border-l border-[#e2e8f0]"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded font-bold text-sm transition-all ${
                    added
                      ? "bg-green-600 text-white"
                      : isOutOfStock
                      ? "bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed"
                      : "bg-[#1a56db] hover:bg-[#1043b2] text-white active:scale-[.98] shadow-sm"
                  }`}
                >
                  {added
                    ? <><Check size={16} /> In den Warenkorb gelegt!</>
                    : isOutOfStock
                    ? "Nicht verfügbar"
                    : <><ShoppingCart size={16} /> In den Warenkorb</>
                  }
                </button>

                {/* Secondary actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => inCompare ? removeCompare(product.id) : addCompare(product)}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold border transition-colors ${
                      inCompare
                        ? "border-[#1a56db] text-[#1a56db] bg-[#eff4ff]"
                        : "border-[#e2e8f0] text-[#64748b] hover:border-[#93c5fd] hover:text-[#1a56db]"
                    }`}
                  >
                    <GitCompare size={13} />
                    {inCompare ? "Im Vergleich" : "Vergleichen"}
                  </button>
                  <Link href="/b2b"
                    className="flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold border border-[#e2e8f0] text-[#64748b] hover:border-[#93c5fd] hover:text-[#1a56db] transition-colors">
                    <FileText size={13} /> Angebot
                  </Link>
                </div>

                {/* Trust block */}
                <div className="pt-3 border-t border-[#f1f5f9] space-y-2">
                  {[
                    { icon: Truck,       text: "Gratis-Versand ab 99 €",       sub: "Express ab 5,99 €" },
                    { icon: CreditCard,  text: "Kauf auf Rechnung",            sub: "Für B2B-Kunden" },
                    { icon: Shield,      text: "2 Jahre Garantie",             sub: "Herstellergarantie" },
                    { icon: RotateCcw,   text: "30 Tage Rückgaberecht",        sub: "Kostenlos" },
                  ].map(({ icon: Icon, text, sub }) => (
                    <div key={text} className="flex items-start gap-2.5">
                      <Icon size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] font-semibold text-[#334155]">{text}</p>
                        <p className="text-[10px] text-[#94a3b8]">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* B2B block */}
                <div className="pt-3 border-t border-[#f1f5f9] bg-[#f8faff] rounded p-3 -mx-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 size={13} className="text-[#1a56db]" />
                    <p className="text-xs font-bold text-[#1a56db]">Firmenkunden & B2B</p>
                  </div>
                  <p className="text-[11px] text-[#64748b] mb-2">Mengenrabatt, Rahmenvertrag & Projektangebot verfügbar.</p>
                  <div className="flex flex-col gap-1.5">
                    <Link href="/b2b" className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-white bg-[#1a56db] hover:bg-[#1043b2] py-1.5 px-3 rounded transition-colors">
                      <FileText size={11} /> Angebot anfragen
                    </Link>
                    <a href="tel:+4930123456789" className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#1a56db] hover:underline">
                      <Phone size={11} /> +49 30 123 456 789
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-6 bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-[#e2e8f0] overflow-x-auto scrollbar-hide">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px flex-shrink-0 ${
                  activeTab === key
                    ? "border-[#1a56db] text-[#1a56db]"
                    : "border-transparent text-[#64748b] hover:text-[#334155]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-5 lg:p-6">
            {/* Description */}
            {activeTab === "description" && (
              <div className="max-w-3xl">
                <div className="text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-[#f1f5f9]">
                    <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-[#f1f5f9] text-[#64748b] px-2.5 py-1 rounded font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specs — grouped table */}
            {activeTab === "specs" && (
              <div className="max-w-2xl">
                {specGroups.length > 0 ? (
                  <div className="space-y-6">
                    {specGroups.map((group) => (
                      <div key={group.label}>
                        <h3 className="text-xs font-black text-[#94a3b8] uppercase tracking-widest mb-2">
                          {group.label}
                        </h3>
                        <table className="w-full text-sm border border-[#e2e8f0] rounded overflow-hidden">
                          <tbody>
                            {group.items.map(([key, value], i) => (
                              <tr key={key} className={i % 2 === 0 ? "bg-[#f8fafc]" : "bg-white"}>
                                <td className="py-2.5 px-4 font-semibold text-[#475569] w-[45%] border-r border-[#f1f5f9] align-top">
                                  {key}
                                </td>
                                <td className="py-2.5 px-4 text-[#1e293b]">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#94a3b8]">Keine technischen Daten für dieses Produkt verfügbar.</p>
                )}
              </div>
            )}

            {/* Shipping */}
            {activeTab === "shipping" && (
              <div className="max-w-xl grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Truck,     title: "Standardlieferung",   text: "1–2 Werktage · Gratis ab 99 €", sub: "DHL / UPS / DPD" },
                  { icon: Clock,     title: "Express-Lieferung",   text: "Nächster Werktag ab 5,99 €",    sub: "Bestellung bis 14 Uhr" },
                  { icon: Package,   title: "Versandvorbereitung", text: "Werktags ab Lager in DE",        sub: "Lagerstandort: Deutschland" },
                  { icon: RotateCcw, title: "Rücksendung",         text: "30 Tage kostenlos zurück",       sub: "Versandlabel inklusive" },
                ].map(({ icon: Icon, title, text, sub }) => (
                  <div key={title} className="flex gap-3 p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
                    <div className="w-9 h-9 bg-white border border-[#e2e8f0] rounded flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[#1a56db]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1e293b]">{title}</p>
                      <p className="text-xs text-[#475569] mt-0.5">{text}</p>
                      <p className="text-[10px] text-[#94a3b8] mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Warranty */}
            {activeTab === "warranty" && (
              <div className="max-w-xl space-y-4">
                {[
                  { icon: Shield,    title: "2 Jahre Herstellergarantie",     text: "Alle Neugeräte kommen mit 2 Jahren Herstellergarantie. Defekte durch Produktionsfehler werden kostenlos behoben oder das Gerät ersetzt." },
                  { icon: Building2, title: "B2B: 3-Jahres-Garantie buchbar", text: "Für Unternehmen bieten wir erweiterte Garantiepakete (3 oder 5 Jahre) inkl. Vor-Ort-Service und NBD (Next Business Day) Reaktionszeit." },
                  { icon: RotateCcw, title: "30 Tage Rückgaberecht",          text: "Volle Rückgabe innerhalb von 30 Tagen. Produkt muss original verpackt und unbeschädigt sein. Kostenloser Rückversand innerhalb Deutschlands." },
                  { icon: Phone,     title: "Technischer Support",            text: "Unser IT-Support-Team hilft bei Einrichtung und Problemen. Mo–Fr 8–18 Uhr telefonisch oder per E-Mail erreichbar." },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-9 h-9 bg-[#eff4ff] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={17} className="text-[#1a56db]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1e293b] mb-1">{title}</p>
                      <p className="text-sm text-[#475569] leading-relaxed">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Related products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-[#0f172a]">Ähnliche Produkte</h2>
              <Link href={`/products?category=${product.category.slug}`}
                className="text-xs text-[#1a56db] font-semibold hover:underline flex items-center gap-1">
                Alle in {product.category.name} <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-[#e2e8f0] shadow-xl px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#64748b] font-medium truncate">{product.name}</p>
          <p className="text-lg font-black text-[#0f172a] tabular-nums leading-none">{fmt(product.price)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm transition-all flex-shrink-0 ${
            added
              ? "bg-green-600 text-white"
              : isOutOfStock
              ? "bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed"
              : "bg-[#1a56db] hover:bg-[#1043b2] text-white"
          }`}
        >
          {added
            ? <><Check size={15} /> Hinzugefügt</>
            : isOutOfStock
            ? "Nicht verfügbar"
            : <><ShoppingCart size={15} /> In den Warenkorb</>
          }
        </button>
      </div>
    </div>
  );
}
