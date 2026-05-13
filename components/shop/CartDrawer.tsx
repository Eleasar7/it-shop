"use client";

// components/shop/CartDrawer.tsx — IT-shop style

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package, Truck } from "lucide-react";
import { useCartStore } from "@/store/cart";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal  = getSubtotal();
  const shipping  = subtotal >= 99 ? 0 : 4.99;
  const remaining = Math.max(0, 99 - subtotal);
  const progress  = Math.min(100, (subtotal / 99) * 100);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    if (isOpen) document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, closeCart]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-[400px] z-50 flex flex-col bg-white shadow-xl animate-slide-in-right"
        role="dialog"
        aria-label="Warenkorb"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8eaed]">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-[#1a56db]" />
            <span className="font-bold text-gray-900">Warenkorb</span>
            {items.length > 0 && (
              <span className="bg-[#eff4ff] text-[#1a56db] text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Free shipping bar */}
        {items.length > 0 && (
          <div className="px-5 py-3 bg-[#f8f9fa] border-b border-[#e8eaed]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1 text-gray-600">
                <Truck size={11} />
                {remaining > 0
                  ? <span>Noch <strong className="text-gray-900">{fmt(remaining)}</strong> bis Gratisversand</span>
                  : <span className="text-green-700 font-semibold">✓ Gratisversand inklusive!</span>
                }
              </span>
            </div>
            <div className="h-1.5 bg-[#e8eaed] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: progress >= 100 ? "#137333" : "#1a56db",
                }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-3 px-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-20">
              <div className="w-16 h-16 bg-[#f1f3f4] rounded-full flex items-center justify-center">
                <Package size={28} className="text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Warenkorb ist leer</p>
                <p className="text-sm text-gray-500 mt-1">Produkte entdecken und hinzufügen</p>
              </div>
              <Link href="/products" onClick={closeCart} className="btn-primary text-sm">
                Zum Shop <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 p-3 bg-white border border-[#e8eaed] rounded-lg group">
                {/* Image */}
                <Link href={`/products/${item.product.slug}`} onClick={closeCart} className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[#f8f9fa] rounded-md overflow-hidden relative border border-[#e8eaed]">
                    {item.product.images[0] ? (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-1" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={18} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#1a56db] uppercase">{item.product.brand}</p>
                  <Link href={`/products/${item.product.slug}`} onClick={closeCart}>
                    <p className="text-xs font-medium text-gray-800 truncate hover:text-[#1a56db] transition-colors">
                      {item.product.name}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{fmt(item.product.price)} / Stk.</p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Qty */}
                    <div className="flex items-center border border-[#dadce0] rounded-md overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 text-xs"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 text-xs"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-gray-900 tabular-nums">
                      {fmt(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="flex-shrink-0 self-start p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-[#e8eaed] bg-[#f8f9fa] space-y-3">
            <div className="space-y-1.5 text-sm">
              {[
                { label: "Zwischensumme", value: fmt(subtotal) },
                { label: "Versand", value: shipping === 0 ? "Kostenlos 🎉" : fmt(shipping), green: shipping === 0 },
              ].map(({ label, value, green }) => (
                <div key={label} className="flex justify-between text-gray-600">
                  <span>{label}</span>
                  <span className={green ? "text-green-700 font-semibold" : "text-gray-800"}>{value}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-1.5 border-t border-[#e8eaed]">
                <span className="text-gray-900">Gesamt</span>
                <span className="text-gray-900 tabular-nums">{fmt(subtotal + shipping)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn-primary w-full py-3 text-base justify-center"
            >
              Zur Kasse <ArrowRight size={16} />
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="btn-secondary w-full text-sm justify-center"
            >
              Warenkorb ansehen
            </Link>
            <p className="text-center text-[10px] text-gray-400">🔒 Sicher bezahlen mit SSL</p>
          </div>
        )}
      </aside>
    </>
  );
}
