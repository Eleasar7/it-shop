"use client";

// app/(shop)/checkout/success/page.tsx
// Cart is cleared on mount so the user doesn't see stale items after payment.

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear the cart exactly once when the success page mounts.
  // Stripe already processed the payment; we're just tidying local state.
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
        style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}>
        <CheckCircle size={40} className="text-green-400" />
      </div>

      <h1 className="text-3xl font-black text-slate-50 mb-3">Zahlung erfolgreich!</h1>
      <p className="text-slate-400 leading-relaxed mb-10 text-base">
        Vielen Dank für deine Bestellung. Du erhältst in Kürze eine
        Bestätigungs-E-Mail mit allen Details.
      </p>

      <div className="card p-6 mb-8 text-left space-y-4">
        <h2 className="font-bold text-slate-200 flex items-center gap-2">
          <Package size={16} className="text-indigo-400" />
          Wie geht es weiter?
        </h2>
        {[
          "Du erhältst eine Bestätigungs-E-Mail",
          "Wir bereiten deine Bestellung vor",
          "Versand innerhalb von 1–2 Werktagen",
          "Tracking-Link wird per E-Mail gesendet",
        ].map((step, i) => (
          <div key={step} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-black text-indigo-400"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
              {i + 1}
            </span>
            <p className="text-sm text-slate-400">{step}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/account/orders" className="btn-primary">
          Meine Bestellungen
          <ArrowRight size={15} />
        </Link>
        <Link href="/products" className="btn-secondary">
          Weiter shoppen
        </Link>
      </div>
    </div>
  );
}
