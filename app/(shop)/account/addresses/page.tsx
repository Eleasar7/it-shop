// app/(shop)/account/addresses/page.tsx

import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { MapPin, Plus, ChevronLeft, Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Adressen | TechCore" };

export default async function AddressesPage() {
  await requireAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/account"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-flex items-center gap-1"
        >
          <ChevronLeft size={13} /> Konto
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Meine Adressen</h1>
        <p className="text-slate-500 text-sm mt-1">
          Verwalte deine Liefer- und Rechnungsadressen
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-sm">
        <Info size={15} className="flex-shrink-0 mt-0.5" />
        <p>
          Lieferadressen werden aktuell beim Checkout direkt über Stripe erfasst.
          Die Verwaltung gespeicherter Adressen wird in einem zukünftigen Update verfügbar sein.
        </p>
      </div>

      {/* Empty state */}
      <div className="card p-12 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mx-auto">
          <MapPin size={28} className="text-slate-500" />
        </div>
        <div>
          <p className="text-slate-300 font-medium text-lg">Keine Adressen gespeichert</p>
          <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
            Gespeicherte Adressen ermöglichen schnelleres Bestellen. Dieses Feature kommt bald.
          </p>
        </div>
        <button
          disabled
          className="btn-secondary inline-flex opacity-50 cursor-not-allowed"
        >
          <Plus size={15} />
          Adresse hinzufügen
          <span className="ml-1.5 text-xs text-slate-500">(Bald verfügbar)</span>
        </button>
      </div>

      {/* Checkout note */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
          <MapPin size={14} className="text-indigo-400" />
          Lieferung beim Checkout
        </h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Beim Abschluss einer Bestellung kannst du deine Lieferadresse direkt im
          Checkout eingeben. Die Adresse wird sicher über Stripe verarbeitet.
        </p>
        <Link href="/products" className="btn-primary text-sm inline-flex">
          Jetzt einkaufen
        </Link>
      </div>
    </div>
  );
}
