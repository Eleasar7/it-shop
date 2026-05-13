// app/(shop)/page.tsx

import Link from "next/link";
import {
  ChevronRight, Truck, Shield, RotateCcw, Phone,
  Package, Building2, FileText, Tag, Zap, Star,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { serializeProducts } from "@/lib/serializers";
import { ProductCard } from "@/components/shop/ProductCard";

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getHomeData() {
  try {
    const [categories, featured, onSale, newest] = await Promise.all([
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
    ]);

    return {
      categories,
      featured: serializeProducts(featured),
      onSale:   serializeProducts(onSale),
      newest:   serializeProducts(newest),
    };
  } catch {
    return { categories: [], featured: [], onSale: [], newest: [] };
  }
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CAT_META: Record<string, { emoji: string; bg: string; border: string }> = {
  laptops:      { emoji: "💻", bg: "bg-blue-50",   border: "border-blue-200" },
  smartphones:  { emoji: "📱", bg: "bg-purple-50", border: "border-purple-200" },
  tablets:      { emoji: "📟", bg: "bg-indigo-50", border: "border-indigo-200" },
  netzwerk:     { emoji: "📡", bg: "bg-green-50",  border: "border-green-200" },
  server:       { emoji: "🖥️", bg: "bg-gray-50",   border: "border-gray-200" },
  monitore:     { emoji: "🖥️", bg: "bg-cyan-50",   border: "border-cyan-200" },
  speicher:     { emoji: "💾", bg: "bg-orange-50", border: "border-orange-200" },
  zubehoer:     { emoji: "🔌", bg: "bg-yellow-50", border: "border-yellow-200" },
  "it-services":{ emoji: "🛠️", bg: "bg-red-50",    border: "border-red-200" },
};

const FALLBACK_CATS = [
  { id:"1", slug:"laptops",     name:"Laptops",      _count:{products:0} },
  { id:"2", slug:"smartphones", name:"Smartphones",  _count:{products:0} },
  { id:"3", slug:"tablets",     name:"Tablets",      _count:{products:0} },
  { id:"4", slug:"netzwerk",    name:"Netzwerk",     _count:{products:0} },
  { id:"5", slug:"server",      name:"Server",       _count:{products:0} },
  { id:"6", slug:"monitore",    name:"Monitore",     _count:{products:0} },
  { id:"7", slug:"speicher",    name:"Speicher",     _count:{products:0} },
  { id:"8", slug:"zubehoer",    name:"Zubehör",      _count:{products:0} },
  { id:"9", slug:"it-services", name:"IT-Services",  _count:{products:0} },
];

const BRANDS = [
  "Apple","Lenovo","HP","Dell","ASUS","MSI","Samsung","NVIDIA","Intel",
  "AMD","Microsoft","Logitech","Synology","Ubiquiti","Acer",
];

const TRUST_ITEMS = [
  { icon: Truck,     label: "Versandkostenfrei", sub: "Ab 99 € Bestellwert" },
  { icon: Shield,    label: "2 Jahre Garantie",  sub: "Auf alle Produkte" },
  { icon: RotateCcw, label: "30 Tage Rückgabe",  sub: "Kostenlos & unkompliziert" },
  { icon: Phone,     label: "B2B-Hotline",        sub: "Mo–Fr 8–18 Uhr" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { categories, featured, onSale, newest } = await getHomeData();
  const displayCats = categories.length > 0 ? categories : FALLBACK_CATS;

  return (
    <div className="bg-[#f8f9fa]">

      {/* ── HERO / CATEGORY STRIP — compact, above-the-fold ── */}
      <section className="bg-white border-b border-[#e8eaed]">
        <div className="section py-5">
          <div className="flex flex-col md:flex-row gap-6 items-start">

            {/* Left: compact copy */}
            <div className="flex-shrink-0 md:w-72">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
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

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-[#e8eaed]">
                {[
                  { v: "10.000+", l: "Produkte" },
                  { v: "2.400+",  l: "B2B-Kunden" },
                  { v: "24h",     l: "Angebot" },
                  { v: "15 J.",   l: "Erfahrung" },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p className="text-base font-extrabold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-400">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: category grid — immediately visible */}
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Kategorien</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {displayCats.slice(0, 10).map((cat) => {
                  const meta = CAT_META[cat.slug] ?? { emoji: "📦", bg: "bg-gray-50", border: "border-gray-200" };
                  return (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className={`${meta.bg} border ${meta.border} rounded-lg p-3 flex flex-col items-center gap-1.5 text-center hover:shadow-sm hover:-translate-y-0.5 transition-all group`}
                    >
                      <span className="text-xl">{meta.emoji}</span>
                      <span className="text-[11px] font-semibold text-gray-700 group-hover:text-[#1a56db] transition-colors leading-tight">{cat.name}</span>
                      {cat._count?.products > 0 && (
                        <span className="text-[9px] text-gray-400">{cat._count.products} Artikel</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="bg-white border-b border-[#e8eaed]">
        <div className="section">
          <div className="flex items-stretch overflow-x-auto scrollbar-hide divide-x divide-[#e8eaed]">
            {TRUST_ITEMS.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5 px-5 py-3 flex-shrink-0 min-w-fit">
                <Icon size={16} className="text-[#1a56db] flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-800">{label}</p>
                  <p className="text-[10px] text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DEAL BANNERS ── */}
      <div className="section py-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 bg-[#1a56db] rounded-lg p-5 flex items-center justify-between text-white overflow-hidden relative">
            <div className="absolute right-4 top-0 bottom-0 flex items-center text-7xl opacity-10 select-none pointer-events-none">💻</div>
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Tag size={11} className="opacity-70" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Neuheiten</span>
              </div>
              <p className="text-lg font-extrabold leading-snug">Business-Laptops ab 799 €</p>
              <p className="text-xs opacity-70 mt-0.5 mb-3">ThinkPad, EliteBook, MacBook</p>
              <Link href="/products?category=laptops"
                className="inline-flex items-center gap-1 bg-white text-[#1a56db] text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-50 transition-colors">
                Entdecken <ChevronRight size={12} />
              </Link>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-5 flex items-center justify-between text-white overflow-hidden relative">
            <div className="absolute right-3 top-0 bottom-0 flex items-center text-6xl opacity-10 select-none pointer-events-none">♻️</div>
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={11} className="text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">B2B Angebot</span>
              </div>
              <p className="text-base font-extrabold leading-snug">Refurbished<br/>bis 40% günstiger</p>
              <p className="text-xs opacity-60 mt-0.5 mb-3">Zertifiziert & geprüft</p>
              <Link href="/products"
                className="inline-flex items-center gap-1 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded border border-white/20 hover:bg-white/25 transition-colors">
                Zum Sortiment <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── BESTSELLER ── */}
      {featured.length > 0 && (
        <div className="section py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star size={15} className="text-amber-500 fill-amber-500" />
              <h2 className="text-base font-extrabold text-gray-900">Bestseller</h2>
            </div>
            <Link href="/products" className="text-xs text-[#1a56db] font-semibold hover:underline flex items-center gap-1">
              Alle ansehen <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* ── BRANDS ── */}
      <div className="section py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-gray-900">Marken</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {BRANDS.map((brand) => (
            <Link key={brand} href={`/products?brand=${brand}`}
              className="flex-shrink-0 bg-white border border-[#dadce0] rounded px-4 py-2.5 text-xs font-bold text-gray-600 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors whitespace-nowrap">
              {brand}
            </Link>
          ))}
        </div>
      </div>

      {/* ── ANGEBOTE ── */}
      {onSale.length > 0 && (
        <div className="section py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-[#c5221f]" />
              <h2 className="text-base font-extrabold text-gray-900">Aktuelle Angebote</h2>
            </div>
            <Link href="/products" className="text-xs text-[#1a56db] font-semibold hover:underline flex items-center gap-1">
              Alle <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {onSale.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      {/* ── B2B ── */}
      <div className="section py-5">
        <div className="bg-white border border-[#e8eaed] rounded-lg p-5 lg:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={14} className="text-[#1a56db]" />
                <span className="text-xs font-bold text-[#1a56db] uppercase tracking-wide">B2B & Firmenkunden</span>
              </div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">IT-Projekt geplant?</h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-4">
                Hardware-Beschaffung, Rollouts, Server, Netzwerk – individuelle Angebote in 24 Stunden.
              </p>
              <ul className="space-y-1.5 mb-5">
                {[
                  "Individuelle Angebote & Rahmenverträge",
                  "Kauf auf Rechnung (30 Tage netto)",
                  "Persönlicher Ansprechpartner",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-3.5 h-3.5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Link href="/b2b" className="btn-primary text-sm py-2">
                  <FileText size={14} /> Projektanfrage
                </Link>
                <a href="tel:+4930123456789" className="btn-secondary text-sm py-2">
                  <Phone size={14} /> +49 30 123 456 789
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
              {[
                { v: "2.400+", l: "B2B-Partner",  icon: "🏢" },
                { v: "24h",    l: "Angebot",       icon: "⚡" },
                { v: "99,8%",  l: "Zufriedenheit", icon: "⭐" },
                { v: "15 J.",  l: "Erfahrung",     icon: "🏆" },
              ].map(({ v, l, icon }) => (
                <div key={l} className="bg-[#f8f9fa] border border-[#e8eaed] rounded-lg p-3 text-center min-w-[90px]">
                  <div className="text-lg mb-0.5">{icon}</div>
                  <p className="text-sm font-extrabold text-gray-900">{v}</p>
                  <p className="text-[10px] text-gray-500">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── NEUHEITEN ── */}
      {newest.length > 0 && (
        <div className="section pb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-extrabold text-gray-900">Neu eingetroffen</h2>
            <Link href="/products?sortBy=newest" className="text-xs text-[#1a56db] font-semibold hover:underline flex items-center gap-1">
              Alle <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {newest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

    </div>
  );
}
