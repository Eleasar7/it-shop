// app/(shop)/impressum/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impressum | TechCore" };

export default function ImpressumPage() {
  return (
    <StaticPage title="Impressum" subtitle="Angaben gemäß § 5 TMG">
      <Section title="Unternehmensangaben">
        <P>TechCore</P>
        <P>Wielandstraße 51</P>
        <P>67117 Limburgerhof</P>
        <P>Deutschland</P>
      </Section>

      <Section title="Kontakt">
        <P>Telefon: +49 176 57719796</P>
        <P>
          E-Mail:{" "}
          <a href="mailto:info@envetra.de" className="text-indigo-400 hover:underline">
            info@envetra.de
          </a>
        </P>
      </Section>

      <Section title="Handelsregister">
        <P>Registergericht: Amtsgericht Speyer</P>
        <P>Registernummer: HRB - </P>
      </Section>

      <Section title="Umsatzsteuer-ID">
        <P>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:
          DE - 
        </P>
      </Section>

      <Section title="Verantwortlicher für den Inhalt (§ 55 Abs. 2 RStV)">
        <P>Eleasar Hadrossek, Wielandstraße 51, 67117 Limburgerhof</P>
      </Section>

      <Section title="EU-Streitschlichtung">
        <P>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
          (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </P>
        <P>
          Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht
          verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </P>
      </Section>
    </StaticPage>
  );
}
