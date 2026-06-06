// app/(shop)/page.tsx

import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ChevronDown,
  Truck,
  Shield,
  RotateCcw,
  Phone,
  Building2,
  FileText,
  Tag,
  Zap,
  Star,
  Server,
  Network,
  HardDrive,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeProducts } from "@/lib/serializers";
import { ProductCard } from "@/components/shop/ProductCard";

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getHomeData() {
  try {
    const [categories, featured, onSale, newest, brandsRaw] = await Promise.all([
      prisma.category.findMany({
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: { where: { isActive: true } } } } },
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true, comparePrice: { not: null } },
        orderBy: { price: "asc" },
        take: 8,
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { category: { select: { id: true, name: true, slug: true } } },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),
    ]);

    return {
      categories,
      featured: serializeProducts(featured),
      onSale: serializeProducts(onSale),
      newest: serializeProducts(newest),
      brands: brandsRaw
        .map((item) => item.brand)
        .filter((brand): brand is string => Boolean(brand)),
    };
  } catch {
    return { categories: [], featured: [], onSale: [], newest: [], brands: [] };
  }
}

// ─── Static data ──────────────────────────────────────────────────────────────

const FALLBACK_CATS = [
  { id: "1", slug: "laptops", name: "Laptops", imageUrl: null, _count: { products: 0 } },
  { id: "2", slug: "smartphones", name: "Smartphones", imageUrl: null, _count: { products: 0 } },
  { id: "3", slug: "tablets", name: "Tablets", imageUrl: null, _count: { products: 0 } },
  { id: "4", slug: "netzwerk", name: "Netzwerk", imageUrl: null, _count: { products: 0 } },
  { id: "5", slug: "server", name: "Server", imageUrl: null, _count: { products: 0 } },
  { id: "6", slug: "monitore", name: "Monitore", imageUrl: null, _count: { products: 0 } },
  { id: "7", slug: "speicher", name: "Speicher", imageUrl: null, _count: { products: 0 } },
  { id: "8", slug: "zubehoer", name: "Zubehör", imageUrl: null, _count: { products: 0 } },
  { id: "9", slug: "it-services", name: "IT-Services", imageUrl: null, _count: { products: 0 } },
];

const TRUST_ITEMS = [
  { icon: Truck, label: "Versandkostenfrei", sub: "Ab 99 € Bestellwert" },
  { icon: Shield, label: "2 Jahre Garantie", sub: "Auf alle Produkte" },
  { icon: RotateCcw, label: "30 Tage Rückgabe", sub: "Kostenlos & unkompliziert" },
  { icon: Phone, label: "B2B-Hotline", sub: "Mo–Fr 8–18 Uhr" },
];

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  cat,
}: {
  cat: { id: string; slug: string; name: string; imageUrl: string | null; _count?: { products: number } };
}) {
  return (
    <Link
      href={`/products?category=${cat.slug}`}
      className="group flex flex-col bg-white border border-[#e2e8f0] rounded-xl overflow-hidden hover:shadow-md hover:border-[#c7d9fb] transition-all duration-200 active:scale-[0.98] min-w-0"
    >
      <div className="relative bg-[#f8fafc]" style={{ paddingTop: "75%" }}>
        {cat.imageUrl ? (
          <Image
            src={cat.imageUrl}
            alt={cat.name}
            fill
            className="object-contain p-3 group-hover:scale-[1.04] transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 select-none">
            <div className="w-10 h-10 rounded-lg border border-dashed border-[#d1d5db] bg-[#f1f5f9]" />
          </div>
        )}
      </div>

      <div className="px-2.5 py-2 sm:px-3 sm:py-2.5">
        <p className="text-[12px] sm:text-[13px] font-bold text-gray-800 group-hover:text-[#1a56db] transition-colors leading-tight truncate">
          {cat.name}
        </p>
        {(cat._count?.products ?? 0) > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5">{cat._count!.products} Artikel</p>
        )}
      </div>
    </Link>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { categories, featured, onSale, newest, brands } = await getHomeData();
  const displayCats = categories.length > 0 ? categories : FALLBACK_CATS;

  return (
    <div className="bg-[#f8f9fa] overflow-x-hidden w-full min-w-0">

      {/* ── HERO ── */}
      <section className="bg-white border-b border-[#e8eaed]">
        <div className="section py-5 sm:py-6">

          {/* Mobile hero — stacked clean layout */}
          <div className="flex flex-col gap-5 md:hidden">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500 font-medium">Lagernd & sofort lieferbar</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2">
                IT-Hardware für<br />Business & Projekte
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Laptops, Server, Netzwerk & Smartphones — direkt vom IT-Fachhandel.
              </p>
              <div className="flex gap-2.5">
                <Link href="/products" className="btn-primary text-sm py-3 flex-1 justify-center">
                  Alle Produkte
                </Link>
                <Link href="/b2b" className="btn-secondary text-sm py-3 flex-1 justify-center">
                  B2B-Anfrage
                </Link>
              </div>
            </div>

            {/* Mobile stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-[#e8eaed]">
              {[
                { v: "10k+", l: "Produkte" },
                { v: "2.4k+", l: "B2B" },
                { v: "24h", l: "Angebot" },
                { v: "15 J.", l: "Erfahrung" },
              ].map(({ v, l }) => (
                <div key={l} className="text-center">
                  <p className="text-sm font-extrabold text-gray-900">{v}</p>
                  <p className="text-[10px] text-gray-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop hero — side by side */}
          <div className="hidden md:flex gap-6 items-start">
            <div className="flex-shrink-0 w-72">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500 font-medium">Lagernd & sofort lieferbar</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2">
                IT-Hardware<br />für Business & Projekte
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Laptops, Server, Netzwerk, Smartphones – direkt vom IT-Fachhandel.
              </p>
              <div className="flex gap-2">
                <Link href="/products" className="btn-primary text-sm py-2">
                  Alle Produkte
                </Link>
                <Link href="/b2b" className="btn-secondary text-sm py-2">
                  B2B-Anfrage
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-[#e8eaed]">
                {[
                  { v: "10.000+", l: "Produkte" },
                  { v: "2.400+", l: "B2B-Kunden" },
                  { v: "24h", l: "Angebot" },
                  { v: "15 J.", l: "Erfahrung" },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p className="text-base font-extrabold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-400">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Kategorien</p>
              <div className="grid grid-cols-4 lg:grid-cols-5 gap-2.5">
                {displayCats.slice(0, 10).map((cat) => (
                  <CategoryCard key={cat.id} cat={cat} />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile category grid */}
          <div className="md:hidden mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Kategorien</p>
              <Link href="/products" className="text-xs text-[#1a56db] font-semibold">Alle →</Link>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {displayCats.slice(0, 9).map((cat) => (
                <CategoryCard key={cat.id} cat={cat} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="bg-white border-b border-[#e8eaed]">
        <div className="section">
          {/* Mobile: 2x2 grid */}
          <div className="grid grid-cols-2 gap-0 md:hidden divide-x divide-y divide-[#e8eaed]">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5 px-3 py-3">
                <Icon size={16} className="text-[#1a56db] flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">{label}</p>
                  <p className="text-[10px] text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: horizontal scroll */}
          <div className="hidden md:flex items-stretch overflow-x-auto scrollbar-hide divide-x divide-[#e8eaed]">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5 px-5 py-3 flex-shrink-0">
                <Icon size={16} className="text-[#1a56db] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 whitespace-nowrap">{label}</p>
                  <p className="text-[10px] text-gray-500 whitespace-nowrap">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KAUFBERATUNG ── */}
      <div className="section py-4 sm:py-5">
        <Link
          href="/beratung"
          className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-5 sm:p-8 text-white shadow-2xl"
        >
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6 min-w-0">
            <div className="max-w-2xl min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-200">
                ✨ Smart Kaufberatung
              </div>

              <h2 className="text-xl sm:text-3xl font-black leading-tight">
                Finde die perfekte Hardware
                <span className="block text-blue-300">in unter 60 Sekunden</span>
              </h2>

              <p className="mt-3 text-sm text-slate-300 leading-relaxed hidden sm:block">
                Egal ob Gaming, Business, Schule oder IT-Projekt — unsere interaktive Kaufberatung empfiehlt dir
                passende Geräte und IT-Hardware.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Gaming PCs", "Business Laptops", "Netzwerk", "Server", "Smartphones"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 border border-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">
              <div className="rounded-xl bg-white px-5 py-3.5 text-slate-950 font-black text-sm sm:text-base transition-all duration-300 group-hover:scale-105 group-active:scale-100">
                Jetzt starten →
              </div>
              <p className="text-xs text-slate-400">Kostenlos • Schnell • Mobil optimiert</p>
            </div>
          </div>
        </Link>
      </div>

      {/* ── DEAL BANNERS ── */}
      <div className="section py-4 sm:py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 bg-[#1a56db] rounded-xl p-5 flex items-center justify-between text-white overflow-hidden relative">
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Tag size={11} className="opacity-70" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Neuheiten</span>
              </div>
              <p className="text-lg font-extrabold leading-snug">Business-Laptops ab 799 €</p>
              <p className="text-xs opacity-70 mt-0.5 mb-3">ThinkPad, EliteBook, MacBook</p>
              <Link
                href="/products?category=laptops"
                className="inline-flex items-center gap-1 bg-white text-[#1a56db] text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Entdecken <ChevronRight size={12} />
              </Link>
            </div>
          </div>
          <div className="bg-gray-900 rounded-xl p-5 flex items-center text-white overflow-hidden relative">
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={11} className="text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">B2B Angebot</span>
              </div>
              <p className="text-base font-extrabold leading-snug">
                Refurbished<br />bis 40% günstiger
              </p>
              <p className="text-xs opacity-60 mt-0.5 mb-3">Zertifiziert & geprüft</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-1 bg-white/15 text-white text-xs font-bold px-4 py-2 rounded-lg border border-white/20 hover:bg-white/25 transition-colors"
              >
                Zum Sortiment <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── BESTSELLER ── */}
      {featured.length > 0 && (
        <div className="section py-4 sm:py-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500 fill-amber-500" />
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">Bestseller</h2>
            </div>
            <Link href="/products" className="text-xs text-[#1a56db] font-semibold hover:underline flex items-center gap-1">
              Alle ansehen <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── BRANDS ── */}
      {brands.length > 0 && (
        <div className="section py-4 sm:py-5">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900">Marken</h2>

            <details className="relative">
              <summary className="list-none cursor-pointer inline-flex items-center gap-2 rounded-lg border border-[#dadce0] bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:border-[#1a56db] hover:text-[#1a56db] transition">
                Marke wählen
                <ChevronDown size={13} />
              </summary>

              <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-[#e8eaed] bg-white shadow-xl">
                <div className="max-h-72 overflow-y-auto py-2">
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-[#f8f9fa] hover:text-[#1a56db]"
                  >
                    Alle Marken anzeigen
                  </Link>

                  {brands.map((brand) => (
                    <Link
                      key={brand}
                      href={`/products?brand=${encodeURIComponent(brand)}`}
                      className="block px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-[#f8f9fa] hover:text-[#1a56db] transition"
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
              </div>
            </details>
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {brands.slice(0, 15).map((brand) => (
              <Link
                key={brand}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className="flex-shrink-0 bg-white border border-[#dadce0] rounded-lg px-4 py-2.5 text-xs font-bold text-gray-600 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors whitespace-nowrap active:scale-[0.97]"
              >
                {brand}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── ANGEBOTE ── */}
      {onSale.length > 0 && (
        <div className="section py-4 sm:py-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Tag size={15} className="text-[#c5221f]" />
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900">Aktuelle Angebote</h2>
            </div>
            <Link href="/products" className="text-xs text-[#1a56db] font-semibold hover:underline flex items-center gap-1">
              Alle <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {onSale.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── B2B ── */}
      <div className="section py-4 sm:py-5">
        <div className="bg-white border border-[#e8eaed] rounded-xl p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5 lg:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={14} className="text-[#1a56db]" />
                <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wide">B2B & Firmenkunden</span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">IT-Projekt geplant?</h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-4">
                Hardware-Beschaffung, Rollouts, Server, Netzwerk – individuelle Angebote in 24 Stunden.
              </p>
              <ul className="space-y-2 mb-5">
                {[
                  "Individuelle Angebote & Rahmenverträge",
                  "Kauf auf Rechnung (30 Tage netto)",
                  "Persönlicher Ansprechpartner",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/b2b" className="btn-primary text-sm py-2.5">
                  <FileText size={14} /> Projektanfrage
                </Link>
                <a href="tel:+4930123456789" className="btn-secondary text-sm py-2.5">
                  <Phone size={14} /> +49 176 57719796
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-shrink-0 w-full lg:w-auto">
              {[
                { v: "2.400+", l: "B2B-Partner" },
                { v: "24h", l: "Angebot" },
                { v: "99,8%", l: "Zufriedenheit" },
                { v: "15 J.", l: "Erfahrung" },
              ].map(({ v, l }) => (
                <div key={l} className="bg-[#f8f9fa] border border-[#e8eaed] rounded-xl p-3 text-center">
                  <p className="text-sm font-extrabold text-gray-900">{v}</p>
                  <p className="text-[11px] text-gray-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── NEUHEITEN ── */}
      {newest.length > 0 && (
        <div className="section pb-6 sm:pb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900">Neu eingetroffen</h2>
            <Link href="/products?sortBy=newest" className="text-xs text-[#1a56db] font-semibold hover:underline flex items-center gap-1">
              Alle <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── IT-SERVICES PROMO ── */}
      <div className="section pb-8 sm:pb-10">
        <div className="bg-white border border-[#e8eaed] rounded-xl overflow-hidden">
          {/* Blue top accent bar */}
          <div className="h-1 bg-[#1a56db]" />
          <div className="p-5 lg:p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-5 lg:gap-8">

              {/* Left — text content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Server size={14} className="text-[#1a56db]" />
                  <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wide">IT-Systemhaus</span>
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">IT-Projekt geplant?</h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-4">
                  Von Hardware-Beschaffung über Netzwerke bis zu Server- und Storage-Lösungen –
                  ENVETRA unterstützt Unternehmen bei moderner IT-Infrastruktur.
                </p>
                <ul className="space-y-2 mb-5">
                  {[
                    { icon: HardDrive, label: "IT-Hardware & Rollout" },
                    { icon: Network,   label: "Netzwerk & WLAN" },
                    { icon: Server,    label: "Server, NAS & Backup" },
                    { icon: Users,     label: "Persönliche Beratung" },
                  ].map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <div className="w-5 h-5 bg-[#eff4ff] rounded flex items-center justify-center flex-shrink-0">
                        <Icon size={11} className="text-[#1a56db]" />
                      </div>
                      {label}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2.5">
                  <Link href="/services" className="btn-primary text-sm py-2.5">
                    IT-Services ansehen <ChevronRight size={14} />
                  </Link>
                  <Link href="/b2b" className="btn-secondary text-sm py-2.5">
                    <FileText size={14} /> Projektanfrage stellen
                  </Link>
                </div>
              </div>

              {/* Right — service tiles */}
              <div className="grid grid-cols-2 gap-2 flex-shrink-0 w-full lg:w-52">
                {[
                  { label: "IT-Hardware",  sub: "Beschaffung & Rollout" },
                  { label: "Netzwerk",     sub: "WLAN & Switches" },
                  { label: "Server & NAS", sub: "Storage & Backup" },
                  { label: "IT-Beratung",  sub: "Herstellerunabhängig" },
                ].map(({ label, sub }) => (
                  <div key={label} className="bg-[#f8f9fa] border border-[#e8eaed] rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-900 leading-tight">{label}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{sub}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
