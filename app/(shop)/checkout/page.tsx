"use client";

// app/(shop)/checkout/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Lock, ArrowRight, ShoppingCart, Package, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 99 ? 0 : 4.99;
  const total = subtotal + shipping;

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout fehlgeschlagen. Bitte versuche es erneut.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Netzwerkfehler. Bitte überprüfe deine Internetverbindung.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
          style={{ background: "#ffffff", border: "1px solid rgba(255,255,255,0.07)" }}>
          <ShoppingCart size={36} className="text-gray-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Warenkorb ist leer</h1>
          <p className="text-gray-9000">Lege zuerst Produkte in deinen Warenkorb.</p>
        </div>
        <Link href="/products" className="btn-primary inline-flex">Zum Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-10">Bestellung abschließen</h1>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Items — 3/5 */}
        <div className="lg:col-span-3 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Deine Artikel ({items.length})
          </p>

          {items.map((item) => (
            <div key={item.productId}
              className="flex gap-4 p-4 rounded-2xl"
              style={{ background: "#ffffff", border: "1px solid #e8eaed" }}>
              <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0"
                style={{ background: "#f8f9fa" }}>
                {item.product.images[0] ? (
                  <Image src={item.product.images[0]} alt={item.product.name}
                    fill className="object-contain p-1.5" sizes="64px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={20} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#1a56db] uppercase tracking-wider mb-0.5">
                  {item.product.brand}
                </p>
                <p className="text-sm font-semibold text-gray-800 truncate">{item.product.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Menge: {item.quantity} × {fmt(item.product.price)}</p>
              </div>
              <p className="text-sm font-black text-gray-900 flex-shrink-0 tabular-nums">
                {fmt(item.product.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        {/* Summary — 2/5 */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl p-6 space-y-5 sticky top-24"
            style={{ background: "#ffffff", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="font-black text-gray-900 text-lg">Bestellübersicht</h2>

            <div className="space-y-3 text-sm">
              {[
                { label: "Zwischensumme", value: fmt(subtotal) },
                { label: "Versand", value: shipping === 0 ? "Kostenlos 🎉" : fmt(shipping), green: shipping === 0 },
                { label: "MwSt. (19%)", value: fmt((subtotal / 1.19) * 0.19) },
              ].map(({ label, value, green }) => (
                <div key={label} className="flex justify-between text-gray-9000">
                  <span>{label}</span>
                  <span className={green ? "text-green-400 font-semibold" : "text-gray-700"}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-black text-base pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-gray-900">Gesamt</span>
                <span className="text-gray-900 tabular-nums">{fmt(total)}</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl text-red-400 text-sm"
                style={{ background: "#fce8e6", border: "1px solid #f1998e" }}>
                {error}
              </div>
            )}

            <button onClick={handleCheckout} disabled={loading}
              className="btn-primary w-full py-4 text-base glow-indigo-sm">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Weiterleitung…</>
              ) : (
                <><Lock size={15} /> Jetzt sicher bezahlen <ArrowRight size={15} /></>
              )}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ShieldCheck, label: "SSL-Verschlüsselt" },
                { icon: Truck, label: "Express verfügbar" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl"
                  style={{ background: "#f8f9fa", border: "1px solid #e8eaed" }}>
                  <Icon size={13} className="text-[#1a56db] flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-gray-400">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["Visa", "MC", "SEPA", "Klarna"].map((m) => (
                <span key={m}
                  className="text-[10px] px-2 py-1 rounded-md font-bold text-slate-700"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
