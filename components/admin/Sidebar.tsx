"use client";

// components/admin/Sidebar.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Cpu, LogOut, ExternalLink, ChevronRight, Building2,
  FileText, Truck, ShoppingCart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/admin/NotificationBell";
import type { UserProfile } from "@/types";

export const NAV_ITEMS = [
  { href: "/admin",                   label: "Dashboard",       icon: LayoutDashboard, exact: true },
  { href: "/admin/products",          label: "Produkte",        icon: Package },
  { href: "/admin/orders",            label: "Bestellungen",    icon: ShoppingBag },
  { href: "/admin/quotes",            label: "Angebote",        icon: FileText },
  { href: "/admin/customers",         label: "Kunden",          icon: Users },
  { href: "/admin/b2b",               label: "B2B-Anfragen",    icon: Building2 },
  { href: "/admin/suppliers",         label: "Lieferanten",     icon: Truck },
  { href: "/admin/purchase-orders",   label: "Einkauf",         icon: ShoppingCart },
];

export function AdminSidebar({ user }: { user: UserProfile }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex w-60 flex-shrink-0 bg-slate-900/80 border-r border-slate-800/60 flex-col min-h-screen sticky top-0 z-30">
      {/* Logo + Bell */}
      <div className="px-4 py-4 border-b border-slate-800/60 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
            <Cpu size={15} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-100 text-sm tracking-tight">TechCore</span>
            <span className="block text-[10px] text-indigo-400 font-semibold uppercase tracking-wider -mt-0.5">Admin</span>
          </div>
        </Link>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon size={16} className={active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="text-indigo-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/60 space-y-1">
        <Link href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all">
          <ExternalLink size={14} /> Shop ansehen
        </Link>
        <div className="px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{user.name ?? "Admin"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all">
          <LogOut size={14} /> Abmelden
        </button>
      </div>
    </aside>
  );
}
