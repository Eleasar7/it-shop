// app/(shop)/datenschutz/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Datenschutz | ${siteConfig.siteName}` };

export default function DatenschutzPage() {
  const { siteName, address, supportEmail, phone } = siteConfig;
  const verantwortlicher = `${siteName}, ${address.street}, ${address.city}`;

  return (
    <StaticPage title="Datenschutzerklärung" subtitle="Informationen gemäß DSGVO / Art. 13 & 14">
      <Section title="1. Verantwortlicher">
        <P>
          {verantwortlicher} ·{" "}
          <a href={`mailto:${supportEmail}`} className="text-[#1a56db] hover:underline">{supportEmail}</a>{" "}
          · {phone}
        </P>
      </Section>

      <Section title="2. Erhobene Daten">
        <P>
          Beim Besuch unserer Website werden folgende Daten verarbeitet:
          IP-Adresse (anonymisiert), aufgerufene Seiten, Datum/Uhrzeit des Zugriffs,
          Referrer-URL sowie verwendeter Browser.
        </P>
        <P>
          Bei einer Bestellung erheben wir: Name, E-Mail-Adresse, Lieferadresse und
          Zahlungsdaten. Zahlungsdaten werden ausschließlich über Stripe verarbeitet
          und nie auf unseren Servern gespeichert.
        </P>
      </Section>

      <Section title="3. Zweck der Verarbeitung">
        <P>
          Daten werden ausschließlich zur Vertragserfüllung (Bestellabwicklung,
          Versand, Kundensupport) sowie zur Erfüllung gesetzlicher Pflichten
          (Buchhaltung, Steuerrecht) verarbeitet.
        </P>
      </Section>

      <Section title="4. Datenweitergabe">
        <P>
          Deine Daten werden nicht an Dritte verkauft. Im Rahmen der
          Vertragserfüllung werden Daten an folgende Dienstleister übermittelt:
          DHL (Versand), Stripe Inc. (Zahlung), Supabase Inc. (Datenbank-Hosting).
          Alle Dienstleister sind auf DSGVO-Konformität verpflichtet.
        </P>
      </Section>

      <Section title="5. Speicherdauer">
        <P>
          Bestelldaten werden gemäß gesetzlicher Aufbewahrungspflicht 10 Jahre
          gespeichert. Account-Daten werden auf Anfrage oder nach Kontolöschung
          innerhalb von 30 Tagen gelöscht.
        </P>
      </Section>

      <Section title="6. Deine Rechte (DSGVO Art. 15–22)">
        <P>
          Du hast das Recht auf: Auskunft · Berichtigung · Löschung ·
          Einschränkung der Verarbeitung · Datenübertragbarkeit · Widerspruch.
        </P>
        <P>
          Anfragen an:{" "}
          <a href={`mailto:${supportEmail}`} className="text-[#1a56db] hover:underline">
            {supportEmail}
          </a>
        </P>
      </Section>

      <Section title="7. Cookies">
        <P>
          Wir setzen ausschließlich technisch notwendige Cookies ein
          (Session-Management, Warenkorb). Es werden keine Tracking- oder
          Marketing-Cookies verwendet.
        </P>
      </Section>

      <Section title="8. Beschwerderecht">
        <P>
          Du hast das Recht, dich bei der zuständigen Aufsichtsbehörde zu
          beschweren. Zuständig ist der Landesbeauftragte für den Datenschutz
          Rheinland-Pfalz:{" "}
          <a href="https://www.datenschutz.rlp.de" target="_blank" rel="noopener noreferrer"
            className="text-[#1a56db] hover:underline">
            www.datenschutz.rlp.de
          </a>
        </P>
      </Section>
    </StaticPage>
  );
}
