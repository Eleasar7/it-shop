// app/(shop)/about/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Über uns | ${siteConfig.siteName}` };

export default function AboutPage() {
  const { siteName, address, supportEmail, phone, businessHours } = siteConfig;

  return (
    <StaticPage
      title={`Über ${siteName}`}
      subtitle="Dein Partner für professionelle IT-Hardware"
    >
      <Section title="Wer wir sind">
        <P>
          {siteName} ist ein unabhängiger IT-Hardware-Händler mit Sitz in{" "}
          {address.city}. Wir beliefern Privatpersonen, Freelancer und Unternehmen
          mit geprüfter Hardware — von iPhones über MacBooks bis hin zu
          Business-Notebooks und Netzwerkzubehör.
        </P>
        <P>
          Unser Team besteht aus erfahrenen IT-Spezialisten, die selbst täglich mit
          den Produkten arbeiten, die wir verkaufen. Das gibt uns einen echten
          Qualitätsanspruch: Wir führen nur Artikel, hinter denen wir stehen.
        </P>
      </Section>

      <Section title="Unsere Werte">
        <P>
          <strong className="text-slate-800 font-semibold">Transparenz:</strong> Faire
          Preise, keine versteckten Kosten. Was du siehst, ist was du zahlst —
          inklusive MwSt.
        </P>
        <P>
          <strong className="text-slate-800 font-semibold">Qualität:</strong> Alle
          Produkte sind originalverpackt, versiegelt und mit Hersteller-Garantie.
        </P>
        <P>
          <strong className="text-slate-800 font-semibold">Service:</strong> Unser
          Support-Team ist {businessHours} erreichbar — per Telefon und E-Mail.
        </P>
      </Section>

      <Section title="Firmenkunden">
        <P>
          Für Unternehmen bieten wir attraktive Mengenpreise, Rahmenverträge und
          einen dedizierten Account-Manager.{" "}
          <a href="/b2b" className="text-[#1a56db] hover:underline">
            Jetzt B2B-Anfrage stellen →
          </a>
        </P>
      </Section>

      <Section title="Kontakt">
        <P>
          {siteName} · {address.street} · {address.city}
        </P>
        <P>
          Telefon:{" "}
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-[#1a56db] hover:underline">
            {phone}
          </a>
          {" "}·{" "}
          E-Mail:{" "}
          <a href={`mailto:${supportEmail}`} className="text-[#1a56db] hover:underline">
            {supportEmail}
          </a>
        </P>
      </Section>
    </StaticPage>
  );
}
