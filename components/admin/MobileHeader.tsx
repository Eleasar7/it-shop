"use client";

// components/admin/MobileHeader.tsx
// FIX: Mobile drawer slides from LEFT – replaced animate-slide-in-right with animate-slide-in-left
// Added a custom keyframe via inline style since Tailwind doesn't have slide-in-left by default.

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Cpu, LogOut } from "lucide-react";
import { NAV_ITEMS } from "./Sidebar";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

export function AdminMobileHeader({ user }: { user: UserProfile }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const currentPage = NAV_ITEMS.find((n) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href)
  );

  return (
    <>
      {/* Top bar – only visible on mobile */}
      <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-slate-900/90 border-b border-slate-800/60 sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Cpu size={13} className="text-white" />
          </div>
          <span className="font-semibold text-slate-100 text-sm">
            {currentPage?.label ?? "Admin"}
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Menü öffnen"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setOpen(false)}
          />
          {/* FIX: slides from LEFT → translateX(-100%) to translateX(0) */}
          <div
            className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/60 flex flex-col lg:hidden"
            style={{ animation: "slideInFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Cpu size={15} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-slate-100 text-sm">TechCore</span>
                  <span className="block text-[10px] text-indigo-400 font-semibold uppercase tracking-wider -mt-0.5">
                    Admin
                  </span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Menü schließen"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
              {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon size={17} className={active ? "text-indigo-400" : "text-slate-500"} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800/60 space-y-2">
              <div className="px-3 py-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
                <p className="text-xs font-medium text-slate-300 truncate">{user.name ?? "Admin"}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all"
              >
                <LogOut size={14} />
                Abmelden
              </button>
            </div>
          </div>

          {/* Keyframe injected inline */}
          <style>{`
            @keyframes slideInFromLeft {
              from { transform: translateX(-100%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>
        </>
      )}
    </>
  );
}
