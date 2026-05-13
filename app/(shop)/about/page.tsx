// app/(shop)/about/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Über uns | TechCore" };

export default function AboutPage() {
  return (
    <StaticPage
      title="Über TechCore"
      subtitle="Dein Partner für professionelle IT-Hardware seit 2015"
    >
      <Section title="Wer wir sind">
        <P>
          TechCore ist ein unabhängiger IT-Hardware-Händler mit Sitz in Stuttgart.
          Wir beliefern Privatpersonen, Freelancer und Unternehmen mit geprüfter
          Hardware — von iPhones über MacBooks bis hin zu Business-Notebooks und
          Netzwerkzubehör.
        </P>
        <P>
          Unser Team besteht aus erfahrenen IT-Spezialisten, die selbst täglich mit
          den Produkten arbeiten, die wir verkaufen. Das gibt uns einen echten
          Qualitätsanspruch: Wir führen nur Artikel, hinter denen wir stehen.
        </P>
      </Section>

      <Section title="Unsere Werte">
        <P>
          <strong className="text-slate-300">Transparenz:</strong> Faire Preise, keine
          versteckten Kosten. Was du siehst, ist was du zahlst — inklusive
          MwSt.
        </P>
        <P>
          <strong className="text-slate-300">Qualität:</strong> Alle Produkte sind
          originalverpackt, versiegelt und mit Hersteller-Garantie.
        </P>
        <P>
          <strong className="text-slate-300">Service:</strong> Unser Support-Team ist
          Mo–Fr von 8 bis 18 Uhr erreichbar — per Telefon, E-Mail und Chat.
        </P>
      </Section>

      <Section title="Firmenkunden">
        <P>
          Für Unternehmen bieten wir attraktive Mengenpreise, Rahmenverträge und
          einen dedizierten Account-Manager.{" "}
          <a href="/b2b" className="text-indigo-400 hover:text-indigo-300 underline">
            Jetzt B2B-Anfrage stellen →
          </a>
        </P>
      </Section>

      <Section title="Kontakt">
        <P>TechCore GmbH · Königstraße 1 · 70173 Stuttgart</P>
        <P>
          📞 +49 711 123 4567 · ✉️ info@techcore-shop.de
        </P>
      </Section>
    </StaticPage>
  );
}
