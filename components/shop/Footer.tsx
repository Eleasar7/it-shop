// components/shop/Footer.tsx — IT-shop style

import Link from "next/link";
import { Phone, Mail, MapPin, Truck, Shield, RotateCcw, CreditCard } from "lucide-react";

const BRANDS = ["Apple", "Lenovo", "HP", "Dell", "ASUS", "Samsung", "NVIDIA", "Intel", "AMD", "Microsoft", "Logitech", "Synology"];

const LINKS: Record<string, Array<{ label: string; href: string }>> = {
  "Produkte": [
    { label: "Alle Produkte",    href: "/products" },
    { label: "Laptops",          href: "/products?category=laptops" },
    { label: "Smartphones",      href: "/products?category=smartphones" },
    { label: "Tablets",          href: "/products?category=tablets" },
    { label: "Netzwerk",         href: "/products?category=netzwerk" },
    { label: "Zubehör",          href: "/products?category=zubehoer" },
    { label: "Produktvergleich", href: "/compare" },
  ],
  "Service": [
    { label: "Kaufberatung",     href: "/beratung" },
    { label: "B2B-Anfragen",     href: "/b2b" },
    { label: "Mein Konto",       href: "/account" },
    { label: "Meine Bestellungen",href: "/account/orders" },
    { label: "Versandinfos",     href: "/versand" },
    { label: "Rückgabe",         href: "/rueckgabe" },
  ],
  "Unternehmen": [
    { label: "Über uns",         href: "/about" },
    { label: "Impressum",        href: "/impressum" },
    { label: "Datenschutz",      href: "/datenschutz" },
    { label: "AGB",              href: "/agb" },
    { label: "Widerruf",         href: "/widerruf" },
  ],
};

const TRUST = [
  { icon: Truck,     label: "Schneller Versand",    sub: "1–2 Werktage" },
  { icon: Shield,    label: "2 Jahre Garantie",      sub: "Geprüfte Ware" },
  { icon: RotateCcw, label: "30 Tage Rückgabe",      sub: "Kostenlos" },
  { icon: CreditCard,label: "Kauf auf Rechnung",     sub: "Für B2B-Kunden" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#e8eaed] bg-[#f8f9fa]">

      {/* Trust strip */}
      <div className="border-b border-[#e8eaed] bg-white">
        <div className="section py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#eff4ff] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-[#1a56db]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{label}</p>
                  <p className="text-[11px] text-gray-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="section py-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#1a56db] rounded-lg flex items-center justify-center text-white font-black text-sm">
                IT
              </div>
              <div>
                <div className="font-extrabold text-lg text-gray-900">ENTREVA</div>
                <div className="text-[10px] text-[#1a56db] font-bold uppercase tracking-widest">Hardware Shop</div>
              </div>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Ihr Partner für IT-Hardware – Laptops, Server, Netzwerk und mehr. Über 10.000 Produkte für B2B und Privatkunden.
            </p>
            <div className="space-y-2">
              {[
                { icon: Phone, text: "+49 176 57719796", href: "tel:+4917657719796" },
                { icon: Mail,  text: "entreva@sales.de",  href: "mailto:sales@entreva.de" },
                { icon: MapPin,text: "Burgunder Platz 2, 67117 Limburgerhof", href: null },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={13} className="text-gray-400 flex-shrink-0" />
                  {href ? (
                    <a href={href} className="text-sm text-gray-600 hover:text-[#1a56db] transition-colors">{text}</a>
                  ) : (
                    <span className="text-sm text-gray-500">{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-[#1a56db] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Brands */}
        <div className="mt-10 pt-8 border-t border-[#e8eaed]">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Unsere Marken</p>
          <div className="flex flex-wrap gap-2">
            {BRANDS.map((brand) => (
              <Link key={brand} href={`/products?brand=${brand}`}
                className="px-3 py-1.5 bg-white border border-[#dadce0] rounded-md text-xs font-semibold text-gray-600 hover:border-[#1a56db] hover:text-[#1a56db] transition-colors">
                {brand}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#e8eaed] bg-white">
        <div className="section py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} ENVETRA · Alle Rechte vorbehalten
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["Visa", "Mastercard", "SEPA", "Klarna", "PayPal"].map((m) => (
              <span key={m} className="text-[10px] px-2 py-1 bg-[#f1f3f4] border border-[#e8eaed] rounded text-gray-500 font-semibold">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
