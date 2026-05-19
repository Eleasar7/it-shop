// app/(shop)/versand/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Versand & Lieferung | ${siteConfig.siteName}` };

export default function VersandPage() {
  const { supportEmail, phone } = siteConfig;

  return (
    <StaticPage title="Versand & Lieferung" subtitle="Alle Infos zu Lieferzeiten, Kosten und Versandarten">
      <Section title="Versandkosten">
        <P>
          Ab einem Bestellwert von{" "}
          <strong className="text-slate-800 font-semibold">99 € (inkl. MwSt.)</strong> liefern
          wir versandkostenfrei innerhalb Deutschlands.
        </P>
        <P>
          Unter 99 € berechnen wir eine Pauschale von{" "}
          <strong className="text-slate-800 font-semibold">4,99 €</strong> für Standard-Versand.
        </P>
      </Section>

      <Section title="Lieferzeiten">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-slate-700 font-semibold">Versandart</th>
                <th className="text-left px-4 py-3 text-slate-700 font-semibold">Lieferzeit</th>
                <th className="text-left px-4 py-3 text-slate-700 font-semibold">Kosten</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ["Standard (DHL)", "2–3 Werktage", "4,99 € / ab 99 € gratis"],
                ["Express (DHL)",  "1–2 Werktage", "9,99 €"],
                ["Österreich",     "3–5 Werktage", "9,99 €"],
                ["Schweiz",        "4–7 Werktage", "14,99 €"],
              ].map(([art, zeit, kosten]) => (
                <tr key={art} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800 font-medium">{art}</td>
                  <td className="px-4 py-3 text-slate-600">{zeit}</td>
                  <td className="px-4 py-3 text-slate-600">{kosten}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Versandpartner">
        <P>
          Wir versenden ausschließlich mit{" "}
          <strong className="text-slate-800 font-semibold">DHL</strong>. Du erhältst nach
          dem Versand eine Tracking-E-Mail mit deiner Sendungsnummer.
        </P>
      </Section>

      <Section title="Bestellung & Versand">
        <P>
          Bestellungen, die bis{" "}
          <strong className="text-slate-800 font-semibold">14:00 Uhr</strong> (Mo–Fr) eingehen
          und sofort verfügbar sind, werden noch am selben Tag versandt.
        </P>
        <P>
          Artikel mit Status „Auf Lager" sind in der Regel innerhalb von 24 Stunden
          versandfertig.
        </P>
      </Section>

      <Section title="Fragen zum Versand?">
        <P>
          Kontaktiere uns unter{" "}
          <a href={`mailto:${supportEmail}`} className="text-[#1a56db] hover:underline">
            {supportEmail}
          </a>{" "}
          oder rufe uns an: {phone}
        </P>
      </Section>
    </StaticPage>
  );
}
