// components/shop/Footer.tsx

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Truck, Shield, RotateCcw, CreditCard } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

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
    { label: "IT-Services",        href: "/services" },
    { label: "Kaufberatung",      href: "/beratung" },
    { label: "B2B-Anfragen",      href: "/b2b" },
    { label: "Mein Konto",        href: "/account" },
    { label: "Meine Bestellungen", href: "/account/orders" },
    { label: "Versandinfos",      href: "/versand" },
    { label: "Rückgabe",          href: "/rueckgabe" },
  ],
  "Unternehmen": [
    { label: "Über uns",   href: "/about" },
    { label: "Impressum",  href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "AGB",        href: "/agb" },
    { label: "Widerruf",   href: "/widerruf" },
  ],
};

const TRUST = [
  { icon: Truck,      label: "Schneller Versand",  sub: "1–2 Werktage" },
  { icon: Shield,     label: "2 Jahre Garantie",   sub: "Geprüfte Ware" },
  { icon: RotateCcw,  label: "30 Tage Rückgabe",   sub: "Kostenlos" },
  { icon: CreditCard, label: "Kauf auf Rechnung",  sub: "Für B2B-Kunden" },
];

/** Inline logo — same logic as Header: SVG → PNG → text badge (SSR safe) */
function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <img
        src="/logo.png"
        alt={siteConfig.siteName}
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}

export function Footer() {
  const { phone, supportEmail, address, businessHours } = siteConfig;
  const phoneHref = `tel:${phone.replace(/\s/g, "")}`;

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
            <FooterLogo />
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              Ihr Partner für IT-Hardware – Laptops, Server, Netzwerk und mehr.
              Geprüfte Qualität für B2B und Privatkunden.
            </p>
            <div className="space-y-2">
              {[
                { icon: Phone,  text: phone,          href: phoneHref },
                { icon: Mail,   text: supportEmail,   href: `mailto:${supportEmail}` },
                { icon: MapPin, text: `${address.street}, ${address.city}`, href: null },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon size={13} className="text-gray-400 flex-shrink-0" />
                  {href ? (
                    <a href={href} className="text-sm text-gray-700 hover:text-[#1a56db] transition-colors">{text}</a>
                  ) : (
                    <span className="text-sm text-gray-600">{text}</span>
                  )}
                </div>
              ))}
              <p className="text-xs text-gray-500 pl-5">{businessHours}</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-600 hover:text-[#1a56db] transition-colors">
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
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Unsere Marken</p>
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
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {siteConfig.brandShort} · Alle Rechte vorbehalten
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["Visa", "Mastercard", "SEPA", "Klarna", "PayPal"].map((m) => (
              <span key={m} className="text-[10px] px-2 py-1 bg-[#f1f3f4] border border-[#e8eaed] rounded text-gray-600 font-semibold">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
