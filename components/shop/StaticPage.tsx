// components/shop/StaticPage.tsx
// Shared layout wrapper used by all legal and info pages

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface StaticPageProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export function StaticPage({
  title,
  subtitle,
  backHref = "/",
  backLabel = "Zurück zur Startseite",
  children,
}: StaticPageProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8"
      >
        <ChevronLeft size={15} />
        {backLabel}
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-600 mt-2 text-base">{subtitle}</p>}
        <div className="mt-4 h-px bg-gradient-to-r from-[#1a56db]/40 to-transparent" />
      </header>

      <div className="space-y-6 text-slate-700 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// Prose helpers used inside static pages
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-700 leading-relaxed">{children}</p>;
}
