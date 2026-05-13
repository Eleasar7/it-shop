import Link from "next/link";
import { Home, Search } from "lucide-react";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Seite nicht gefunden | ZION IT" };
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-8xl font-black text-gray-200 select-none mb-6">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Seite nicht gefunden</h1>
      <p className="text-gray-500 mb-8">Die gesuchte Seite existiert nicht oder wurde verschoben.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-primary"><Home size={15} /> Zur Startseite</Link>
        <Link href="/products" className="btn-secondary"><Search size={15} /> Produkte</Link>
      </div>
    </div>
  );
}
