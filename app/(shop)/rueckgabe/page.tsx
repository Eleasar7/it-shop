// app/(shop)/rueckgabe/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Rückgabe & Garantie | ${siteConfig.siteName}` };

export default function RueckgabePage() {
  const { siteName, retoureEmail, phone } = siteConfig;

  return (
    <StaticPage title="Rückgabe & Garantie" subtitle="30 Tage Rückgaberecht · 2 Jahre Herstellergarantie">
      <Section title="30-Tage-Rückgaberecht">
        <P>
          Du kannst Artikel innerhalb von{" "}
          <strong className="text-slate-800 font-semibold">30 Tagen</strong> nach
          Erhalt ohne Angabe von Gründen zurücksenden — zusätzlich zum gesetzlichen
          14-tägigen Widerrufsrecht.
        </P>
        <P>
          Voraussetzung: Die Ware muss sich im Originalzustand befinden, originalverpackt
          und mit allen Zubehörteilen/Beilagen zurückgeschickt werden.
        </P>
      </Section>

      <Section title="So funktioniert die Rückgabe">
        {[
          `Melde dich unter ${retoureEmail} mit deiner Bestellnummer.`,
          "Du erhältst ein vorfrankiertes DHL-Rücksendeetikett per E-Mail.",
          "Verpacke den Artikel sicher und gib ihn bei einer DHL-Filiale ab.",
          "Nach Eingang und Prüfung erstatten wir den Kaufpreis innerhalb von 5 Werktagen.",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-[#eff4ff] border border-[#c7d9fb] text-[#1a56db] text-xs flex items-center justify-center flex-shrink-0 font-semibold">
              {i + 1}
            </span>
            <P>{step}</P>
          </div>
        ))}
      </Section>

      <Section title="Herstellergarantie">
        <P>
          Alle verkauften Produkte sind Neuware mit voller{" "}
          <strong className="text-slate-800 font-semibold">2-jähriger Herstellergarantie</strong>. Im
          Garantiefall wenden wir uns direkt an den Hersteller für dich.
        </P>
      </Section>

      <Section title="Defekte Artikel">
        <P>
          Erhältst du einen defekten Artikel, melde dich bitte innerhalb von 48 Stunden
          nach Lieferung. Wir ersetzen den Artikel oder erstatten den vollen Kaufpreis —
          Rückversandkosten trägt {siteName}.
        </P>
      </Section>

      <Section title="Kontakt">
        <P>
          Bei Fragen zur Rückgabe:{" "}
          <a href={`mailto:${retoureEmail}`} className="text-[#1a56db] hover:underline">
            {retoureEmail}
          </a>{" "}
          · {phone}
        </P>
      </Section>
    </StaticPage>
  );
}
