"use client";

// app/(shop)/cart/page.tsx — Premium redesign

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cart";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Package, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 99 ? 0 : 4.99;
  const total = subtotal + shipping;
  const freeShippingRemaining = Math.max(0, 99 - subtotal);
  const progressPct = Math.min(100, (subtotal / 99) * 100);

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-32 text-center space-y-7">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto"
          style={{ background: "#ffffff", border: "1px solid rgba(255,255,255,0.07)" }}>
          <ShoppingCart size={40} className="text-gray-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Warenkorb ist leer</h1>
          <p className="text-gray-400 text-sm mt-2">Entdecke unsere Produkte und finde dein nächstes Gerät.</p>
        </div>
        <Link href="/products" className="btn-primary text-base px-8 py-3.5 inline-flex">
          Zum Shop <ArrowRight size={17} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black text-gray-900">Warenkorb</h1>
        <button onClick={() => clearCart()}
          className="text-xs font-semibold text-slate-700 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/5">
          Alle entfernen
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Items – 3/5 */}
        <div className="lg:col-span-3 space-y-3">
          {items.map((item) => (
            <div key={item.productId}
              className="flex gap-4 p-4 rounded-2xl group transition-all duration-200"
              style={{ background: "#ffffff", border: "1px solid #e8eaed" }}>

              <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                <div className="w-[84px] h-[84px] rounded-2xl overflow-hidden relative"
                  style={{ background: "#f8f9fa" }}>
                  {item.product.images[0] ? (
                    <Image src={item.product.images[0]} alt={item.product.name}
                      fill className="object-contain p-2" sizes="84px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-[#1a56db] uppercase tracking-wider mb-0.5">
                  {item.product.brand}
                </p>
                <Link href={`/products/${item.product.slug}`}>
                  <p className="text-sm font-bold text-gray-800 hover:text-white transition-colors line-clamp-2">
                    {item.product.name}
                  </p>
                </Link>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">{fmt(item.product.price)} / Stk.</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center rounded-xl overflow-hidden"
                    style={{ border: "1px solid #e8eaed", background: "#f8f9fa" }}>
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-white transition-colors disabled:opacity-30">
                      <Minus size={13} />
                    </button>
                    <span className="w-9 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-white transition-colors disabled:opacity-30">
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-base font-black text-gray-900 tabular-nums">
                      {fmt(item.product.price * item.quantity)}
                    </p>
                    <button onClick={() => removeItem(item.productId)}
                      className="p-1.5 text-slate-700 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary – 2/5 */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl p-6 space-y-5 sticky top-24"
            style={{ background: "#ffffff", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="font-black text-gray-900 text-lg">Bestellübersicht</h2>

            {/* Free shipping progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Truck size={12} />
                  {freeShippingRemaining > 0
                    ? <span>Noch <span className="text-gray-700">{fmt(freeShippingRemaining)}</span> bis Gratis-Versand</span>
                    : <span className="text-green-400">Gratisversand inklusive!</span>
                  }
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f1f3f4" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: progressPct >= 100 ? "#22c55e" : "linear-gradient(90deg, #4f46e5, #7c3aed)",
                  }} />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-3 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
              <div className="flex justify-between text-gray-600">
                <span>Zwischensumme ({items.reduce((s, i) => s + i.quantity, 0)} Artikel)</span>
                <span className="text-gray-700 font-semibold tabular-nums">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Versand</span>
                <span className={`font-semibold ${shipping === 0 ? "text-green-400" : "text-gray-700"}`}>
                  {shipping === 0 ? "Gratis 🎉" : fmt(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 text-xs">
                <span>MwSt. (19%)</span>
                <span className="text-gray-400 tabular-nums">{fmt((subtotal / 1.19) * 0.19)}</span>
              </div>
              <div className="flex justify-between font-black text-lg pt-3"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-gray-900">Gesamt</span>
                <span className="text-gray-900 tabular-nums">{fmt(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full py-4 text-base glow-indigo-sm">
              Jetzt bestellen <ArrowRight size={17} />
            </Link>
            <Link href="/products" className="btn-secondary w-full py-3 text-sm justify-center">
              Weiter shoppen
            </Link>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-700 pt-1">
              {[
                { icon: ShieldCheck, label: "SSL-Verschlüsselt" },
                { icon: RotateCcw, label: "30 Tage Rückgabe" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <Icon size={11} /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
