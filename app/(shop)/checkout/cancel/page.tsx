// app/(shop)/checkout/cancel/page.tsx

import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Zahlung abgebrochen | TechCore" };

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center space-y-7">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: "rgb(var(--bg-elevated))", border: "1px solid rgba(255,255,255,0.07)" }}>
        <ShoppingCart size={28} className="text-slate-500" />
      </div>
      <div>
        <h1 className="text-xl font-black text-slate-100 mb-2">Zahlung abgebrochen</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Deine Zahlung wurde abgebrochen. Dein Warenkorb ist noch vollständig erhalten.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/checkout" className="btn-primary">
          <ShoppingCart size={15} /> Erneut versuchen
        </Link>
        <Link href="/products" className="btn-secondary">
          <ArrowLeft size={15} /> Weiter shoppen
        </Link>
      </div>
    </div>
  );
}
