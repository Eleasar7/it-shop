// app/(shop)/widerruf/page.tsx

import { StaticPage, Section, P } from "@/components/shop/StaticPage";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Widerrufsrecht | ${siteConfig.siteName}` };

export default function WiderrufPage() {
  const { siteName, address, supportEmail, phone } = siteConfig;
  const contactBlock = `${siteName}, ${address.street}, ${address.city}, ${supportEmail}, ${phone}`;

  return (
    <StaticPage title="Widerrufsrecht & Widerrufsformular" subtitle="Gesetzliches Widerrufsrecht gemäß §§ 355 ff. BGB">
      <Section title="Widerrufsbelehrung">
        <P>
          Du hast das Recht, binnen{" "}
          <strong className="text-slate-800 font-semibold">vierzehn Tagen</strong> ohne
          Angabe von Gründen diesen Vertrag zu widerrufen.
        </P>
        <P>
          Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem du oder ein von
          dir benannter Dritter, der nicht der Beförderer ist, die letzte Ware in
          Besitz genommen hat.
        </P>
      </Section>

      <Section title="Ausübung des Widerrufsrechts">
        <P>
          Um dein Widerrufsrecht auszuüben, musst du uns ({contactBlock}) mittels einer
          eindeutigen Erklärung (z. B. Brief, E-Mail) über deinen Entschluss, diesen
          Vertrag zu widerrufen, informieren.
        </P>
        <P>
          Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über
          die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.
        </P>
      </Section>

      <Section title="Folgen des Widerrufs">
        <P>
          Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von
          dir erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der
          zusätzlichen Kosten, die sich daraus ergeben, dass du eine andere Art der
          Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt
          hast), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
          zurückzuzahlen, an dem die Mitteilung über deinen Widerruf dieses Vertrags
          bei uns eingegangen ist.
        </P>
      </Section>

      <Section title="Muster-Widerrufsformular">
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <P>An: {siteName}, {address.street}, {address.city},{" "}
            <a href={`mailto:${supportEmail}`} className="text-[#1a56db] hover:underline">{supportEmail}</a>
          </P>
          <P>
            Hiermit widerrufe(n) ich/wir den von mir/uns abgeschlossenen Vertrag über
            den Kauf der folgenden Waren:
          </P>
          <P>Bestellt am: _________________ · Erhalten am: _________________</P>
          <P>Name des/der Verbraucher(s): _________________</P>
          <P>Anschrift des/der Verbraucher(s): _________________</P>
          <P>Datum: _________________</P>
          <P>Unterschrift: _________________ (nur bei Mitteilung auf Papier)</P>
        </div>
      </Section>
    </StaticPage>
  );
}
