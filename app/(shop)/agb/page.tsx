// app/(shop)/agb/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `AGB | ${siteConfig.siteName}` };

export default function AgbPage() {
  const { siteName, address } = siteConfig;
  const shopId = `${siteName}, ${address.street}, ${address.city}`;

  return (
    <StaticPage title="Allgemeine Geschäftsbedingungen" subtitle="Stand: Januar 2025">
      <Section title="§ 1 Geltungsbereich">
        <P>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen über
          den Online-Shop von {shopId} (nachfolgend „{siteName}").
        </P>
      </Section>

      <Section title="§ 2 Vertragsschluss">
        <P>
          Die Präsentation der Produkte im Online-Shop stellt kein rechtlich bindendes
          Angebot dar. Der Kaufvertrag kommt erst zustande, wenn {siteName} die Bestellung
          durch eine Auftragsbestätigung per E-Mail annimmt.
        </P>
      </Section>

      <Section title="§ 3 Preise und Zahlung">
        <P>
          Alle Preise sind Endpreise inkl. der gesetzlichen Mehrwertsteuer. Versandkosten
          werden im Bestellprozess gesondert ausgewiesen.
        </P>
        <P>
          Zahlung ist möglich per Kreditkarte (Visa, Mastercard), SEPA-Lastschrift,
          Klarna und Apple Pay. Die Zahlung wird über Stripe abgewickelt.
        </P>
      </Section>

      <Section title="§ 4 Lieferung">
        <P>
          Die Lieferung erfolgt an die vom Kunden angegebene Lieferadresse. Lieferzeiten
          und Versandkosten sind der Versandseite zu entnehmen.
        </P>
      </Section>

      <Section title="§ 5 Eigentumsvorbehalt">
        <P>
          Die gelieferte Ware bleibt bis zur vollständigen Bezahlung Eigentum von {siteName}.
        </P>
      </Section>

      <Section title="§ 6 Gewährleistung">
        <P>
          Es gelten die gesetzlichen Gewährleistungsrechte. Die Gewährleistungsfrist
          beträgt 2 Jahre ab Lieferung.
        </P>
      </Section>

      <Section title="§ 7 Haftung">
        <P>
          {siteName} haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit. Bei
          einfacher Fahrlässigkeit haftet {siteName} nur für die Verletzung wesentlicher
          Vertragspflichten und begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
        </P>
      </Section>

      <Section title="§ 8 Anwendbares Recht">
        <P>
          Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand
          ist Speyer, soweit gesetzlich zulässig.
        </P>
      </Section>

      <Section title="§ 9 Streitbeilegung">
        <P>
          {siteName} ist nicht verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </P>
      </Section>
    </StaticPage>
  );
}
