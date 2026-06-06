"use client";

// components/shop/Header.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight,
  LogOut, Package, LayoutDashboard, Phone, Truck,
  Shield, FileText, GitCompare, Clock, Loader2, ArrowLeft, Headphones,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useCompareStore } from "@/store/compare";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site-config";
import type { UserProfile } from "@/types";

interface NavChild {
  label: string;
  href: string;
}

interface NavCategory {
  label: string;
  href: string;
  columns: Array<{ heading: string; items: NavChild[] }>;
  featured?: { label: string; href: string; badge?: string };
}

const NAV: NavCategory[] = [
  {
    label: "Laptops & PCs",
    href: "/products?category=laptops",
    columns: [
      {
        heading: "Business",
        items: [
          { label: "Lenovo ThinkPad",    href: "/products?category=laptops&brand=Lenovo" },
          { label: "HP EliteBook",       href: "/products?category=laptops&brand=HP" },
          { label: "Dell Latitude",      href: "/products?category=laptops&brand=Dell" },
          { label: "Apple MacBook",      href: "/products?category=laptops&brand=Apple" },
        ],
      },
      {
        heading: "Consumer / Schule",
        items: [
          { label: "Gaming Laptops",     href: "/products?category=laptops&brand=ASUS" },
          { label: "Ultrabooks",         href: "/products?category=laptops" },
          { label: "Chromebooks",        href: "/products?category=laptops" },
          { label: "2-in-1 Convertible", href: "/products?category=laptops" },
        ],
      },
      {
        heading: "Desktop & Workstation",
        items: [
          { label: "Tower-PCs",          href: "/products" },
          { label: "Mini-PCs",           href: "/products" },
          { label: "Workstations",       href: "/products" },
          { label: "All-in-One PCs",     href: "/products" },
        ],
      },
    ],
    featured: { label: "Alle Laptops & PCs →", href: "/products?category=laptops" },
  },
  {
    label: "Komponenten",
    href: "/products",
    columns: [
      {
        heading: "Prozessoren & RAM",
        items: [
          { label: "Intel Prozessoren",   href: "/products?brand=Intel" },
          { label: "AMD Prozessoren",     href: "/products?brand=AMD" },
          { label: "DDR5 Arbeitsspeicher", href: "/products" },
          { label: "DDR4 Arbeitsspeicher", href: "/products" },
        ],
      },
      {
        heading: "Grafik & Speicher",
        items: [
          { label: "NVIDIA Grafikkarten", href: "/products?brand=NVIDIA" },
          { label: "AMD Grafikkarten",    href: "/products?brand=AMD" },
          { label: "NVMe SSDs",           href: "/products" },
          { label: "SATA SSDs & HDDs",    href: "/products" },
        ],
      },
      {
        heading: "Mainboard & Gehäuse",
        items: [
          { label: "Mainboards",          href: "/products" },
          { label: "PC-Gehäuse",          href: "/products" },
          { label: "Netzteile",           href: "/products" },
          { label: "Kühlsysteme",         href: "/products" },
        ],
      },
    ],
    featured: { label: "Alle Komponenten →", href: "/products" },
  },
  {
    label: "Server & Netzwerk",
    href: "/products",
    columns: [
      {
        heading: "Server",
        items: [
          { label: "Rack-Server",         href: "/products" },
          { label: "Tower-Server",        href: "/products" },
          { label: "Blade-Server",        href: "/products" },
          { label: "NAS-Systeme",         href: "/products?brand=Synology" },
        ],
      },
      {
        heading: "Netzwerk",
        items: [
          { label: "Managed Switches",    href: "/products?category=netzwerk" },
          { label: "Router & Firewalls",  href: "/products?category=netzwerk" },
          { label: "WLAN Access Points",  href: "/products?category=netzwerk" },
          { label: "Ubiquiti UniFi",      href: "/products?brand=Ubiquiti" },
        ],
      },
      {
        heading: "Infrastruktur",
        items: [
          { label: "USV / Stromversorgung", href: "/products" },
          { label: "Rack & Schränke",     href: "/products" },
          { label: "Kabel & SFP",         href: "/products" },
          { label: "KVM-Switches",        href: "/products" },
        ],
      },
    ],
    featured: { label: "Server & Netzwerk →", href: "/products" },
  },
  {
    label: "Smartphones & Tablets",
    href: "/products?category=smartphones",
    columns: [
      {
        heading: "Apple",
        items: [
          { label: "iPhone 16 Serie",     href: "/products?category=smartphones&brand=Apple" },
          { label: "iPhone 15 Serie",     href: "/products?category=smartphones&brand=Apple" },
          { label: "iPad Pro",            href: "/products?category=tablets&brand=Apple" },
          { label: "iPad Air / Mini",     href: "/products?category=tablets&brand=Apple" },
        ],
      },
      {
        heading: "Android",
        items: [
          { label: "Samsung Galaxy",      href: "/products?category=smartphones&brand=Samsung" },
          { label: "Business Smartphones", href: "/products?category=smartphones" },
          { label: "Android Tablets",     href: "/products?category=tablets" },
          { label: "Rugged Devices",      href: "/products?category=smartphones" },
        ],
      },
    ],
    featured: { label: "Alle Smartphones & Tablets →", href: "/products?category=smartphones" },
  },
  {
    label: "Monitore & Displays",
    href: "/products?category=monitore",
    columns: [
      {
        heading: "Business",
        items: [
          { label: "24–27 Zoll",          href: "/products?category=monitore" },
          { label: "Ultra-Wide",          href: "/products?category=monitore" },
          { label: "4K-Monitore",         href: "/products?category=monitore" },
          { label: "Dual-Monitor Sets",   href: "/products?category=monitore" },
        ],
      },
      {
        heading: "Zubehör",
        items: [
          { label: "Monitor-Arme",        href: "/products?category=zubehoer" },
          { label: "KVM-Switches",        href: "/products" },
          { label: "Docking Stations",    href: "/products?category=zubehoer" },
          { label: "Kabel & Adapter",     href: "/products?category=zubehoer" },
        ],
      },
    ],
    featured: { label: "Alle Monitore →", href: "/products?category=monitore" },
  },
  {
    label: "Zubehör & Services",
    href: "/products?category=zubehoer",
    columns: [
      {
        heading: "Peripherie",
        items: [
          { label: "Tastaturen & Mäuse",  href: "/products?category=zubehoer" },
          { label: "Headsets",            href: "/products?category=zubehoer" },
          { label: "Webcams",             href: "/products?category=zubehoer" },
          { label: "Drucker & Scanner",   href: "/products?category=zubehoer" },
        ],
      },
      {
        heading: "IT-Services",
        items: [
          { label: "Garantie-Verlängerung", href: "/products?category=it-services" },
          { label: "Rollout-Services",     href: "/products?category=it-services" },
          { label: "Hardware-Reparatur",   href: "/products?category=it-services" },
          { label: "IT-Beratung",          href: "/beratung" },
        ],
      },
    ],
    featured: { label: "Alle Services →", href: "/products?category=it-services" },
  },
];

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  price: number;
}

interface HeaderProps {
  initialUser?: UserProfile | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

function LogoImage() {
  return (
    <Image
      src="/logo.png"
      alt={siteConfig.siteName}
      fill
      className="object-contain object-left"
      priority
    />
  );
}

export function Header({ initialUser = null }: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);
  const menuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { openCart, items } = useCartStore();
  const compareCount = 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
    }
  }, [items, mounted]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (initialUser !== null) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) { setUser(null); return; }
      const res = await fetch("/api/account/profile");
      if (res.ok) setUser(await res.json());
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products ?? []);
          setShowSuggestions(true);
        }
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setFocused(false);
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setFocused(false);
      setShowSuggestions(false);
      setMobileSearchOpen(false);
      setMobileOpen(false);
    }
  }

  const openMenu = useCallback((label: string) => {
    if (menuTimerRef.current) clearTimeout(menuTimerRef.current);
    setActiveMenu(label);
  }, []);

  const closeMenu = useCallback(() => {
    menuTimerRef.current = setTimeout(() => setActiveMenu(null), 120);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

  return (
    <>
      {/* ── TOP BAR (desktop only) ── */}
      <div className="hidden md:block bg-[#0f172a] text-[#94a3b8] text-[11px]">
        <div className="section">
          <div className="flex items-center justify-between h-8">
            <div className="flex items-center divide-x divide-[#1e293b]">
              <span className="flex items-center gap-1.5 px-4">
                <Truck size={10} className="text-green-400" />
                Gratis-Versand ab 99 €
              </span>
              <span className="flex items-center gap-1.5 px-4">
                <Phone size={10} className="text-blue-400" />
                B2B-Hotline:{" "}
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                  className="text-white ml-1 font-semibold hover:text-blue-300 transition-colors">
                  {siteConfig.phoneDisplay}
                </a>
              </span>
              <span className="flex items-center gap-1.5 px-4">
                <Clock size={10} className="text-slate-400" />
                {siteConfig.businessHours}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Shield size={10} className="text-green-400" /> 30 Tage Rückgabe
              </span>
              <span className="text-slate-600">|</span>
              <Link href="/beratung" className="hover:text-white transition-colors">Kaufberatung</Link>
              <Link href="/b2b" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
                B2B & Firmenkunden
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] shadow-sm w-full">

        {/* Mobile search overlay */}
        {mobileSearchOpen && (
          <div className="md:hidden fixed inset-0 z-[60] bg-white flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e2e8f0]">
              <button
                onClick={() => { setMobileSearchOpen(false); setQuery(""); setShowSuggestions(false); }}
                className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Schließen"
              >
                <ArrowLeft size={20} />
              </button>
              <form onSubmit={handleSearch} className="flex-1">
                <div className="flex border border-[#1a56db] rounded-xl overflow-hidden ring-2 ring-[#1a56db]/15">
                  <input
                    ref={mobileSearchRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Produkt, Marke oder SKU suchen …"
                    className="flex-1 px-4 py-3 text-[15px] outline-none bg-white text-gray-900 placeholder-[#9ca3af]"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="bg-[#1a56db] text-white px-4 flex items-center flex-shrink-0"
                    aria-label="Suchen"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </button>
                </div>
              </form>
            </div>
            {/* Mobile search results */}
            <div className="flex-1 overflow-y-auto">
              {showSuggestions && results.length > 0 ? (
                <>
                  <div className="px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Produkte</span>
                  </div>
                  {results.map((r) => (
                    <Link
                      key={r.id}
                      href={`/products/${r.slug}`}
                      onClick={() => { setMobileSearchOpen(false); setQuery(""); }}
                      className="flex items-center gap-4 px-4 py-4 hover:bg-[#f1f5f9] transition-colors border-b border-[#f1f5f9] last:border-none"
                    >
                      <Package size={18} className="text-[#94a3b8] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                        <p className="text-xs text-[#64748b] mt-0.5">{r.brand}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">{fmt(r.price)}</span>
                    </Link>
                  ))}
                  <Link
                    href={`/products?search=${encodeURIComponent(query)}`}
                    onClick={() => setMobileSearchOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-4 bg-[#f0f4ff] text-sm font-semibold text-[#1a56db]"
                  >
                    Alle Ergebnisse für „{query}&rdquo; anzeigen <ChevronRight size={14} />
                  </Link>
                </>
              ) : showSuggestions && query.length >= 2 ? (
                <div className="px-4 py-10 text-center text-gray-500">
                  <Package size={36} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-sm font-medium">Keine Produkte gefunden</p>
                  <p className="text-xs text-gray-400 mt-1">für „{query}&rdquo;</p>
                </div>
              ) : (
                <div className="px-4 py-6">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Beliebte Kategorien</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Laptops", "Server", "Smartphones", "RAM", "SSDs", "Netzwerk"].map((cat) => (
                      <Link
                        key={cat}
                        href={`/products?category=${cat.toLowerCase()}`}
                        onClick={() => setMobileSearchOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-[#f8fafc] rounded-lg text-sm font-medium text-gray-700 hover:bg-[#eff4ff] hover:text-[#1a56db] transition-colors"
                      >
                        <ChevronRight size={12} className="text-gray-400" />
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* ── Main header row ── */}
        <div className="section">
          <div className="flex items-center gap-2 h-14 md:h-16 min-w-0">

            {/* Logo */}
            <Link href="/" className="relative flex items-center flex-shrink-0 h-8 w-[90px] sm:w-[110px] md:h-10 md:w-[130px]">
              <LogoImage />
            </Link>

            {/* Desktop Search */}
            <div ref={searchRef} className="hidden md:flex flex-1 relative max-w-2xl">
              <form onSubmit={handleSearch} className="w-full">
                <div className={`flex border overflow-hidden transition-all ${
                  focused ? "border-[#1a56db] ring-2 ring-[#1a56db]/15" : "border-[#cbd5e1]"
                } rounded`}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    placeholder="Produkt, Marke, SKU oder Modell suchen …"
                    className="flex-1 px-3 py-2 text-sm outline-none bg-white text-gray-900 placeholder-[#94a3b8] min-w-0"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="bg-[#1a56db] hover:bg-[#1043b2] text-white px-4 flex items-center transition-colors flex-shrink-0"
                    aria-label="Suchen"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  </button>
                </div>
              </form>

              {/* Desktop live suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-0.5 bg-white border border-[#e2e8f0] rounded shadow-xl z-50 overflow-hidden">
                  {results.length > 0 ? (
                    <>
                      <div className="px-3 py-1.5 bg-[#f8fafc] border-b border-[#e2e8f0]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Produkte</span>
                      </div>
                      {results.map((r) => (
                        <Link
                          key={r.id}
                          href={`/products/${r.slug}`}
                          onClick={() => { setFocused(false); setQuery(""); }}
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#f1f5f9] transition-colors border-b border-[#f1f5f9] last:border-none"
                        >
                          <Package size={14} className="text-[#94a3b8] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                            <p className="text-[10px] text-[#94a3b8]">{r.brand}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 flex-shrink-0">{fmt(r.price)}</span>
                        </Link>
                      ))}
                      <Link
                        href={`/products?search=${encodeURIComponent(query)}`}
                        onClick={() => setFocused(false)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#f8fafc] text-xs font-semibold text-[#1a56db] hover:bg-[#eff4ff] transition-colors"
                      >
                        Alle Ergebnisse für „{query}&#8221; anzeigen <ChevronRight size={12} />
                      </Link>
                    </>
                  ) : (
                    <div className="px-4 py-5 text-center text-sm text-gray-600">
                      Keine Produkte für „{query}&#8221; gefunden
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Spacer on mobile */}
            <div className="flex-1 min-w-0 md:hidden" />

            {/* Right actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">

              {/* Mobile search button */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Suchen"
              >
                <Search size={19} />
              </button>

              {/* Compare (desktop only) */}
              {mounted && compareCount > 0 && (
                <Link href="/compare"
                  className="relative hidden sm:flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Vergleich">
                  <GitCompare size={19} />
                  <span className="text-[9px] font-medium">Vergleich</span>
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#1a56db] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {compareCount}
                  </span>
                </Link>
              )}

              {/* Account */}
              <div className="relative z-[9999]">
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setFocused(false); }}
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Mein Konto"
                >
                  <User size={20} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#e2e8f0] rounded-xl shadow-2xl py-1.5 z-[9999] animate-fade-in">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-[#f1f5f9]">
                          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Angemeldet als</p>
                          <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{user.email}</p>
                        </div>
                        <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#f8fafc]" onClick={() => setUserMenuOpen(false)}>
                          <Package size={15} className="text-gray-400" /> Mein Konto
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-[#f8fafc]" onClick={() => setUserMenuOpen(false)}>
                          <FileText size={15} className="text-gray-400" /> Meine Bestellungen
                        </Link>
                        {user.role === "ADMIN" && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-[#1a56db] font-semibold hover:bg-[#eff4ff]" onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard size={15} /> Admin-Bereich
                          </Link>
                        )}
                        <div className="border-t border-[#f1f5f9] mt-1 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                            <LogOut size={15} /> Abmelden
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-[#f1f5f9]">
                          <Link href="/login" onClick={() => setUserMenuOpen(false)}
                            className="w-full btn-primary justify-center text-sm py-2.5">
                            Anmelden
                          </Link>
                          <Link href="/register" onClick={() => setUserMenuOpen(false)}
                            className="w-full btn-secondary justify-center text-sm py-2 mt-2">
                            Registrieren
                          </Link>
                        </div>
                        <div className="px-4 py-2.5">
                          <Link href="/b2b" className="text-xs text-[#1a56db] font-semibold hover:underline" onClick={() => setUserMenuOpen(false)}>
                            B2B-Firmenkonto erstellen →
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                onClick={() => { openCart(); setFocused(false); }}
                className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Warenkorb"
              >
                <ShoppingCart size={20} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#1a56db] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP CATEGORY NAV ── */}
        <nav className="hidden md:block border-t border-[#f1f5f9] bg-white relative z-40">
          <div className="section">
            <div className="flex items-center">
              {NAV.map((cat) => (
                <div
                  key={cat.label}
                  className="relative"
                  onMouseEnter={() => openMenu(cat.label)}
                  onMouseLeave={closeMenu}
                >
                  <Link
                    href={cat.href}
                    className={`flex items-center gap-1 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeMenu === cat.label
                        ? "text-[#1a56db] border-[#1a56db] bg-[#f8faff]"
                        : "text-[#334155] border-transparent hover:text-[#1a56db] hover:bg-[#f8faff]"
                    }`}
                  >
                    {cat.label}
                    <ChevronDown size={11} className={`text-gray-400 transition-transform ${activeMenu === cat.label ? "rotate-180" : ""}`} />
                  </Link>

                  {activeMenu === cat.label && (
                    <div
                      className="absolute top-full left-0 bg-white border border-[#e2e8f0] rounded-b-lg shadow-2xl z-50 animate-fade-in"
                      style={{ minWidth: `${cat.columns.length * 180 + 32}px` }}
                      onMouseEnter={() => openMenu(cat.label)}
                      onMouseLeave={closeMenu}
                    >
                      <div className="p-5 grid gap-6" style={{ gridTemplateColumns: `repeat(${cat.columns.length}, 1fr)` }}>
                        {cat.columns.map((col) => (
                          <div key={col.heading}>
                            <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-widest mb-2.5">
                              {col.heading}
                            </p>
                            <ul className="space-y-0.5">
                              {col.items.map((item) => (
                                <li key={item.label}>
                                  <Link
                                    href={item.href}
                                    onClick={() => setActiveMenu(null)}
                                    className="flex items-center gap-1.5 py-1 px-2 text-[13px] text-[#334155] hover:text-[#1a56db] hover:bg-[#f0f4ff] rounded transition-colors"
                                  >
                                    <ChevronRight size={10} className="text-gray-300 flex-shrink-0" />
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {cat.featured && (
                        <div className="border-t border-[#f1f5f9] px-5 py-2.5 flex items-center justify-between">
                          <Link
                            href={cat.featured.href}
                            onClick={() => setActiveMenu(null)}
                            className="text-xs font-bold text-[#1a56db] hover:underline flex items-center gap-1"
                          >
                            {cat.featured.label}
                          </Link>
                          {cat.featured.badge && (
                            <span className="text-[10px] font-bold bg-[#eff4ff] text-[#1a56db] px-2 py-0.5 rounded border border-[#c7d9fb]">
                              {cat.featured.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex-1" />

              <Link
                href="/services"
                className="flex items-center gap-1.5 ml-3 px-3 py-1.5 text-[#3c4043] text-[12px] font-semibold rounded hover:bg-[#f1f3f4] transition-colors"
              >
                IT-Services
              </Link>

              <Link
                href="/b2b"
                className="flex items-center gap-1.5 ml-2 px-3 py-1.5 bg-[#1a56db] text-white text-[12px] font-bold rounded hover:bg-[#1043b2] transition-colors"
              >
                <FileText size={12} /> Angebot anfragen
              </Link>
            </div>
          </div>
        </nav>

        {/* ── MOBILE MENU DRAWER ── */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <div className="md:hidden fixed left-0 top-0 bottom-0 z-[60] w-[85vw] max-w-[360px] bg-white shadow-2xl flex flex-col animate-slide-in-from-left">
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#e2e8f0]">
                <Link href="/" onClick={() => setMobileOpen(false)} className="relative h-8 w-[100px] flex-shrink-0">
                  <LogoImage />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* User status strip */}
              <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#1a56db] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {(user.name ?? user.email ?? "?")[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{user.name ?? "Konto"}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="text-xs text-red-500 font-medium">Abmelden</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="flex-1 btn-primary text-sm py-2.5 justify-center">Anmelden</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 btn-secondary text-sm py-2.5 justify-center">Registrieren</Link>
                  </div>
                )}
              </div>

              {/* Scrollable nav */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {/* Category nav items */}
                {NAV.map((cat) => (
                  <div key={cat.label} className="border-b border-[#f1f5f9]">
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === cat.label ? null : cat.label)}
                      className="w-full flex items-center justify-between px-4 py-4 text-sm font-semibold text-gray-800 hover:bg-[#f8fafc] transition-colors active:bg-[#f1f5f9]"
                    >
                      <span>{cat.label}</span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${mobileExpanded === cat.label ? "rotate-180" : ""}`}
                      />
                    </button>

                    {mobileExpanded === cat.label && (
                      <div className="bg-[#f8fafc] pb-3">
                        {cat.columns.map((col) => (
                          <div key={col.heading} className="px-5 pt-3">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{col.heading}</p>
                            {col.items.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-[#1a56db] active:text-[#1a56db] transition-colors"
                              >
                                <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                        <div className="px-5 pt-3">
                          <Link
                            href={cat.href}
                            onClick={() => setMobileOpen(false)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a56db] hover:underline"
                          >
                            {cat.featured?.label ?? `Alle ${cat.label} →`}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Footer links */}
                <div className="px-4 py-5 space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Mehr</p>
                  <Link href="/beratung" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-2.5 text-sm text-gray-700 hover:text-[#1a56db]">
                    <Phone size={15} className="text-gray-400" /> Kaufberatung
                  </Link>
                  <Link href="/services" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-2.5 text-sm font-semibold text-[#1a56db]">
                    <Headphones size={15} /> IT-Services & Systemhaus
                  </Link>
                  <Link href="/b2b" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 py-2.5 text-sm font-semibold text-[#1a56db]">
                    <FileText size={15} /> B2B & Firmenkunden
                  </Link>
                  {user && (
                    <>
                      <Link href="/account" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 py-2.5 text-sm text-gray-700 hover:text-[#1a56db]">
                        <Package size={15} className="text-gray-400" /> Mein Konto
                      </Link>
                      <Link href="/account/orders" onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 py-2.5 text-sm text-gray-700 hover:text-[#1a56db]">
                        <FileText size={15} className="text-gray-400" /> Bestellungen
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Drawer footer */}
              <div className="px-4 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Truck size={11} className="text-green-500" /> Versand ab 99 €</span>
                  <span className="flex items-center gap-1"><Shield size={11} className="text-green-500" /> 30 Tage Rückgabe</span>
                  <span className="flex items-center gap-1"><Phone size={11} className="text-blue-500" /> B2B-Hotline</span>
                </div>
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
