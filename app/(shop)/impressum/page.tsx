// app/(shop)/impressum/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Impressum | ${siteConfig.siteName}` };

export default function ImpressumPage() {
  const { address, phone, supportEmail, siteName, ownerName, vatId, responsible } = siteConfig;
  return (
    <StaticPage title="Impressum" subtitle="Angaben gemäß § 5 TMG">
      <Section title="Unternehmensangaben">
        <P>{siteName}</P>
        <P>Inhaber: {ownerName}</P>
        <P>{address.street}</P>
        <P>{address.city}</P>
        <P>{address.country}</P>
      </Section>

      <Section title="Kontakt">
        <P>Telefon: {phone}</P>
        <P>
          E-Mail:{" "}
          <a href={`mailto:${supportEmail}`} className="text-[#1a56db] hover:underline">
            {supportEmail}
          </a>
        </P>
      </Section>

      <Section title="Umsatzsteuer-ID">
        <P>
          Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {vatId}
        </P>
      </Section>

      <Section title="Verantwortlicher für den Inhalt (§ 55 Abs. 2 RStV)">
        <P>{responsible}</P>
      </Section>

      <Section title="EU-Streitschlichtung">
        <P>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
          (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1a56db] hover:underline"
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
