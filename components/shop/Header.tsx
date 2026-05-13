"use client";

// components/shop/Header.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight,
  LogOut, Package, LayoutDashboard, Phone, Truck,
  Shield, FileText, GitCompare, Clock, Loader2,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useCompareStore } from "@/store/compare";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

// ─── Mega-menu category data ──────────────────────────────────────────────────

interface NavChild {
  label: string;
  href: string;
}

interface NavCategory {
  label: string;
  icon: string;
  href: string;
  columns: Array<{ heading: string; items: NavChild[] }>;
  featured?: { label: string; href: string; badge?: string };
}

const NAV: NavCategory[] = [
  {
    label: "Laptops & PCs",
    icon: "💻",
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
    icon: "⚙️",
    href: "/products",
    columns: [
      {
        heading: "Prozessoren & RAM",
        items: [
          { label: "Intel Prozessoren",  href: "/products?brand=Intel" },
          { label: "AMD Prozessoren",    href: "/products?brand=AMD" },
          { label: "DDR5 Arbeitsspeicher",href: "/products" },
          { label: "DDR4 Arbeitsspeicher",href: "/products" },
        ],
      },
      {
        heading: "Grafik & Speicher",
        items: [
          { label: "NVIDIA Grafikkarten",href: "/products?brand=NVIDIA" },
          { label: "AMD Grafikkarten",   href: "/products?brand=AMD" },
          { label: "NVMe SSDs",          href: "/products" },
          { label: "SATA SSDs & HDDs",   href: "/products" },
        ],
      },
      {
        heading: "Mainboard & Gehäuse",
        items: [
          { label: "Mainboards",         href: "/products" },
          { label: "PC-Gehäuse",         href: "/products" },
          { label: "Netzteile",          href: "/products" },
          { label: "Kühlsysteme",        href: "/products" },
        ],
      },
    ],
    featured: { label: "Alle Komponenten →", href: "/products" },
  },
  {
    label: "Server & Netzwerk",
    icon: "🖥️",
    href: "/products",
    columns: [
      {
        heading: "Server",
        items: [
          { label: "Rack-Server",        href: "/products" },
          { label: "Tower-Server",       href: "/products" },
          { label: "Blade-Server",       href: "/products" },
          { label: "NAS-Systeme",        href: "/products?brand=Synology" },
        ],
      },
      {
        heading: "Netzwerk",
        items: [
          { label: "Managed Switches",   href: "/products?category=netzwerk" },
          { label: "Router & Firewalls", href: "/products?category=netzwerk" },
          { label: "WLAN Access Points", href: "/products?category=netzwerk" },
          { label: "Ubiquiti UniFi",     href: "/products?brand=Ubiquiti" },
        ],
      },
      {
        heading: "Infrastruktur",
        items: [
          { label: "USV / Stromversorgung",href: "/products" },
          { label: "Rack & Schränke",    href: "/products" },
          { label: "Kabel & SFP",        href: "/products" },
          { label: "KVM-Switches",       href: "/products" },
        ],
      },
    ],
    featured: { label: "Server & Netzwerk →", href: "/products" },
  },
  {
    label: "Smartphones",
    icon: "📱",
    href: "/products?category=smartphones",
    columns: [
      {
        heading: "Apple",
        items: [
          { label: "iPhone 16 Serie",    href: "/products?category=smartphones&brand=Apple" },
          { label: "iPhone 15 Serie",    href: "/products?category=smartphones&brand=Apple" },
          { label: "iPad Pro",           href: "/products?category=tablets&brand=Apple" },
          { label: "iPad Air / Mini",    href: "/products?category=tablets&brand=Apple" },
        ],
      },
      {
        heading: "Android",
        items: [
          { label: "Samsung Galaxy S",   href: "/products?category=smartphones&brand=Samsung" },
          { label: "Samsung Galaxy A",   href: "/products?category=smartphones&brand=Samsung" },
          { label: "Android Tablets",    href: "/products?category=tablets" },
          { label: "Alle Smartphones",   href: "/products?category=smartphones" },
        ],
      },
      {
        heading: "Zubehör",
        items: [
          { label: "Schutzhüllen",       href: "/products?category=zubehoer" },
          { label: "Ladegeräte",         href: "/products?category=zubehoer" },
          { label: "Kopfhörer & Earbuds",href: "/products?category=zubehoer" },
          { label: "Smartwatches",       href: "/products?category=zubehoer" },
        ],
      },
    ],
    featured: { label: "Alle Smartphones & Tablets →", href: "/products?category=smartphones" },
  },
  {
    label: "Monitore & Peripherie",
    icon: "🖥️",
    href: "/products",
    columns: [
      {
        heading: "Monitore",
        items: [
          { label: "24\" Business",      href: "/products" },
          { label: "27\" & 32\" QHD/4K", href: "/products" },
          { label: "Curved Monitore",    href: "/products" },
          { label: "Touchscreen",        href: "/products" },
        ],
      },
      {
        heading: "Eingabe & Audio",
        items: [
          { label: "Tastaturen",         href: "/products?category=zubehoer" },
          { label: "Mäuse",              href: "/products?category=zubehoer" },
          { label: "Headsets",           href: "/products?category=zubehoer" },
          { label: "Webcams",            href: "/products?category=zubehoer" },
        ],
      },
      {
        heading: "Drucker & Scanner",
        items: [
          { label: "Laserdrucker",       href: "/products" },
          { label: "Tintenstrahldrucker",href: "/products" },
          { label: "Multifunktionsgeräte",href: "/products" },
          { label: "Scanner",            href: "/products" },
        ],
      },
    ],
    featured: { label: "Alle Monitore & Peripherie →", href: "/products" },
  },
  {
    label: "Software",
    icon: "💾",
    href: "/products",
    columns: [
      {
        heading: "Microsoft",
        items: [
          { label: "Microsoft 365",      href: "/products?brand=Microsoft" },
          { label: "Windows 11",         href: "/products?brand=Microsoft" },
          { label: "Windows Server",     href: "/products?brand=Microsoft" },
          { label: "MS Office (OEM)",    href: "/products?brand=Microsoft" },
        ],
      },
      {
        heading: "Sicherheit & Backup",
        items: [
          { label: "Antivirussoftware",  href: "/products" },
          { label: "Endpoint Security",  href: "/products" },
          { label: "Backup-Lösungen",    href: "/products" },
          { label: "VPN-Software",       href: "/products" },
        ],
      },
    ],
    featured: { label: "Alle Software & Lizenzen →", href: "/products", badge: "B2B Volumenlizenzen" },
  },
];

// ─── Live search hook ─────────────────────────────────────────────────────────

function useSearch() {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<Array<{ id: string; name: string; slug: string; price: number; brand: string }>>([]);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&pageSize=6`);
      if (res.ok) {
        const data = await res.json();
        setResults((data.data ?? []).slice(0, 6));
      }
    } catch { /* silently ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length >= 2) {
      timerRef.current = setTimeout(() => search(query), 300);
    } else {
      setResults([]);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, search]);

  return { query, setQuery, results, loading, focused, setFocused };
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  user?: UserProfile | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [mobileExpanded,setMobileExpanded]= useState<string | null>(null);
  const [activeMenu,    setActiveMenu]    = useState<string | null>(null);
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  // Mounted guard — prevents hydration mismatch from Zustand/localStorage.
  // Before mount, cart count is 0 on both server and client.
  const [mounted, setMounted] = useState(false);
  const menuTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef    = useRef<HTMLDivElement>(null);

  const { query, setQuery, results, loading, focused, setFocused } = useSearch();

  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart  = useCartStore((s) => s.openCart);
  const compareCount = useCompareStore((s) => s.items.length);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setFocused(false);
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const handleLogout = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const openMenu  = (label: string) => {
    if (menuTimer.current) clearTimeout(menuTimer.current);
    setActiveMenu(label);
  };
  const closeMenu = () => {
    menuTimer.current = setTimeout(() => setActiveMenu(null), 150);
  };

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobileOpen(false); setActiveMenu(null); setFocused(false); }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  // Set mounted after first client render so cart/compare counts from
  // Zustand (persisted in localStorage) are only read after hydration.
  useEffect(() => { setMounted(true); }, []);

  // Close search on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const showSuggestions = focused && (results.length > 0 || (query.trim().length >= 2 && !loading));

  return (
    <>
      {/* ── TOPBAR ── */}
      <div className="hidden lg:block bg-[#1e293b] text-slate-300 text-[11px]">
        <div className="section flex items-center justify-between h-7 gap-6">
          <div className="flex items-center divide-x divide-slate-600/40">
            <span className="flex items-center gap-1.5 pr-4">
              <Truck size={10} className="text-green-400" />
              Gratis-Versand ab 99 €
            </span>
            <span className="flex items-center gap-1.5 px-4">
              <Phone size={10} className="text-blue-400" />
              B2B-Hotline: <strong className="text-white ml-1">+49 30 123 456 789</strong>
            </span>
            <span className="flex items-center gap-1.5 px-4">
              <Clock size={10} className="text-slate-400" />
              Mo–Fr 8–18 Uhr
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

      {/* ── MAIN HEADER ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] shadow-sm">
        <div className="section">
          <div className="flex items-center gap-3 h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-1">
              <div className="w-8 h-8 bg-[#1a56db] rounded flex items-center justify-center text-white font-black text-xs leading-none select-none">
                ZION<br className="hidden" />IT
              </div>
              <div className="hidden sm:block leading-none">
                <div className="font-black text-[15px] tracking-tight text-gray-900">ZION IT</div>
                <div className="text-[8px] text-[#1a56db] font-bold uppercase tracking-[0.15em]">Hardware Shop</div>
              </div>
            </Link>

            {/* Search */}
            <div ref={searchRef} className="flex-1 relative max-w-2xl">
              <form onSubmit={handleSearch}>
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

              {/* Live search suggestions */}
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
                        onClick={() => { setFocused(false); }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#f8fafc] text-xs font-semibold text-[#1a56db] hover:bg-[#eff4ff] transition-colors"
                      >
                        Alle Ergebnisse für „{query}" anzeigen <ChevronRight size={12} />
                      </Link>
                    </>
                  ) : (
                    <div className="px-4 py-5 text-center text-sm text-gray-500">
                      Keine Produkte für „{query}" gefunden
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-0.5 flex-shrink-0">

              {/* Compare */}
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
              <div className="relative">
                <button
                  onClick={() => { setUserMenuOpen(!userMenuOpen); setFocused(false); }}
                  className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Mein Konto"
                >
                  <User size={19} />
                  <span className="text-[9px] font-medium hidden sm:block">
                    {user ? (user.name?.split(" ")[0] ?? "Konto") : "Anmelden"}
                  </span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#e2e8f0] rounded-lg shadow-xl py-1 z-50 animate-fade-in">
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-[#f1f5f9]">
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Angemeldet als</p>
                          <p className="text-sm font-semibold text-gray-900 truncate mt-0.5">{user.email}</p>
                        </div>
                        <Link href="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8fafc]" onClick={() => setUserMenuOpen(false)}>
                          <Package size={14} className="text-gray-400" /> Mein Konto
                        </Link>
                        <Link href="/account/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8fafc]" onClick={() => setUserMenuOpen(false)}>
                          <FileText size={14} className="text-gray-400" /> Meine Bestellungen
                        </Link>
                        {user.role === "ADMIN" && (
                          <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1a56db] font-semibold hover:bg-[#eff4ff]" onClick={() => setUserMenuOpen(false)}>
                            <LayoutDashboard size={14} /> Admin-Bereich
                          </Link>
                        )}
                        <div className="border-t border-[#f1f5f9] mt-1 pt-1">
                          <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                            <LogOut size={14} /> Abmelden
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 border-b border-[#f1f5f9]">
                          <Link href="/login" onClick={() => setUserMenuOpen(false)}
                            className="w-full btn-primary justify-center text-sm py-2">
                            Anmelden
                          </Link>
                          <Link href="/register" onClick={() => setUserMenuOpen(false)}
                            className="w-full btn-secondary justify-center text-sm py-1.5 mt-1.5">
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
                className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={`Warenkorb (${mounted ? itemCount : 0})`}
              >
                <ShoppingCart size={19} />
                <span className="text-[9px] font-medium hidden sm:block">Warenkorb</span>
                {mounted && itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-[#c5221f] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center p-2 rounded text-gray-600 hover:bg-gray-100 ml-1"
                aria-label="Menü"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── CATEGORY NAV with REAL MEGA MENUS ── */}
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
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                      activeMenu === cat.label
                        ? "text-[#1a56db] border-[#1a56db] bg-[#f8faff]"
                        : "text-[#334155] border-transparent hover:text-[#1a56db] hover:bg-[#f8faff]"
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    {cat.label}
                    <ChevronDown size={11} className={`text-gray-400 transition-transform ${activeMenu === cat.label ? "rotate-180" : ""}`} />
                  </Link>

                  {/* ── MEGA MENU PANEL ── */}
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
                href="/b2b"
                className="flex items-center gap-1.5 ml-3 px-3 py-1.5 bg-[#1a56db] text-white text-[12px] font-bold rounded hover:bg-[#1043b2] transition-colors"
              >
                <FileText size={12} /> Angebot anfragen
              </Link>
            </div>
          </div>
        </nav>

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#f1f5f9] bg-white max-h-[80vh] overflow-y-auto">
            <div className="py-2">
              {/* Mobile search */}
              <div className="px-4 pb-3 border-b border-[#f1f5f9]">
                <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }}>
                  <div className="flex border border-[#cbd5e1] rounded overflow-hidden">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Suchen …"
                      className="flex-1 px-3 py-2 text-sm outline-none"
                    />
                    <button type="submit" className="bg-[#1a56db] text-white px-3">
                      <Search size={14} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Mobile categories — expandable */}
              {NAV.map((cat) => (
                <div key={cat.label} className="border-b border-[#f8fafc] last:border-none">
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === cat.label ? null : cat.label)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-[#f8fafc] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      {cat.label}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform ${mobileExpanded === cat.label ? "rotate-180" : ""}`}
                    />
                  </button>

                  {mobileExpanded === cat.label && (
                    <div className="bg-[#f8fafc] pb-2">
                      {cat.columns.map((col) => (
                        <div key={col.heading} className="px-4 pt-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{col.heading}</p>
                          {col.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-1.5 py-1.5 pl-2 text-sm text-gray-700 hover:text-[#1a56db]"
                            >
                              <ChevronRight size={10} className="text-gray-300" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                      <div className="px-4 pt-3">
                        <Link
                          href={cat.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-xs font-bold text-[#1a56db] hover:underline"
                        >
                          {cat.featured?.label ?? `Alle ${cat.label} →`}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Mobile account + actions */}
              <div className="px-4 py-3 border-t border-[#e2e8f0] flex flex-col gap-2 mt-1">
                {user ? (
                  <>
                    <Link href="/account" onClick={() => setMobileOpen(false)}
                      className="btn-secondary justify-center text-sm">Mein Konto</Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="text-sm text-red-600 font-medium text-center py-2 hover:bg-red-50 rounded">
                      Abmelden
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}
                      className="btn-primary justify-center text-sm">Anmelden</Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}
                      className="btn-secondary justify-center text-sm">Registrieren</Link>
                  </>
                )}
                <Link href="/b2b" onClick={() => setMobileOpen(false)}
                  className="text-xs text-center text-[#1a56db] font-semibold py-1">
                  B2B-Firmenkonto & Anfragen →
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
