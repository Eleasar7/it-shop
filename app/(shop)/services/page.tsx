// app/(shop)/services/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import {
  Monitor, Network, Server, Briefcase, Lightbulb, Headphones,
  CheckCircle, ArrowRight, Users, Zap, Star, ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "IT-Services & Systemhaus | ENVETRA",
  description:
    "ENVETRA – Ihr IT-Systemhaus für Unternehmen. Von Business-Hardware über Netzwerktechnik bis zur kompletten IT-Infrastruktur. Persönliche Beratung, schnelle Beschaffung, zuverlässige Umsetzung.",
};

const SERVICES = [
  {
    icon: Monitor,
    title: "IT-Hardware",
    description: "Professionelle Business-Hardware für jeden Arbeitsplatz – von der Beschaffung bis zum vollständigen Rollout.",
    items: ["Business Notebooks", "Workstations", "Monitore", "Zubehör", "Beschaffung & Rollout"],
    color: "#1a56db",
    bg: "#eff4ff",
  },
  {
    icon: Network,
    title: "Netzwerktechnik",
    description: "Stabile und sichere Netzwerkinfrastruktur für Ihr Unternehmen – von der Planung bis zur Inbetriebnahme.",
    items: ["Switches", "Access Points", "WLAN Planung", "Standortvernetzung"],
    color: "#0f7c4a",
    bg: "#e6f4ea",
  },
  {
    icon: Server,
    title: "Server & Storage",
    description: "Zuverlässige Datenspeicherung und Backup-Lösungen für einen sicheren Geschäftsbetrieb.",
    items: ["NAS Lösungen", "Fileserver", "Datenspeicherung", "Backup Systeme"],
    color: "#7c3aed",
    bg: "#f3f0ff",
  },
  {
    icon: Briefcase,
    title: "Arbeitsplatzlösungen",
    description: "Ergonomische und produktive Arbeitsplätze – maßgeschneidert für Apple- und Windows-Umgebungen.",
    items: ["Dockingstations", "Monitor-Arbeitsplätze", "Apple & Windows Umgebungen"],
    color: "#b45309",
    bg: "#fffbeb",
  },
  {
    icon: Lightbulb,
    title: "IT-Beratung",
    description: "Herstellerunabhängige Beratung für Ihre IT-Infrastruktur – von der Planung bis zur Modernisierung.",
    items: ["Hardwareplanung", "Infrastrukturplanung", "Modernisierung bestehender Systeme"],
    color: "#0891b2",
    bg: "#ecfeff",
  },
  {
    icon: Headphones,
    title: "Wartung & Support",
    description: "Schnelle Hilfe bei technischen Problemen – vor Ort oder per Fernwartung, für laufende Betreuung.",
    items: ["Fehleranalyse", "Fernwartung", "Vor-Ort-Service", "Laufende Betreuung"],
    color: "#137333",
    bg: "#e6f4ea",
  },
] as const;

const ADVANTAGES = [
  { icon: Users,      title: "Persönliche Betreuung",        desc: "Fester Ansprechpartner, der Ihr Unternehmen kennt." },
  { icon: Monitor,    title: "Moderne Business Hardware",     desc: "Aktuelle Geräte führender Hersteller für professionellen Einsatz." },
  { icon: Zap,        title: "Schnelle Beschaffung",          desc: "Kurze Lieferzeiten und direkter Zugang zu Lagerware." },
  { icon: Lightbulb,  title: "Herstellerunabhängige Beratung", desc: "Wir empfehlen, was wirklich zu Ihnen passt." },
  { icon: Star,       title: "Individuelle Lösungen",         desc: "Keine Einheitslösungen – jedes Unternehmen ist anders." },
  { icon: ShieldCheck, title: "Zuverlässige Umsetzung",       desc: "Termingerechte und professionelle Projektumsetzung." },
] as const;

const SHOWCASE = [
  {
    category: "Arbeitsplatz",
    title: "Modernisierung eines Büroarbeitsplatzes",
    desc: "Kompletter Austausch veralteter Hardware – neue Business-Notebooks, Dockingstations und Monitore für ein mittelständisches Unternehmen.",
    tags: ["Hardware", "Rollout", "Beratung"],
  },
  {
    category: "Netzwerk",
    title: "Netzwerkaufbau für Unternehmen",
    desc: "Planung und Installation einer vollständigen Netzwerkinfrastruktur mit Switches, Access Points und strukturierter Verkabelung.",
    tags: ["Netzwerk", "WLAN", "Planung"],
  },
  {
    category: "Server & Backup",
    title: "NAS- und Backup-Lösung",
    desc: "Einrichtung einer zentralen Datenspeicherung mit automatisiertem Backup-System und Monitoring für einen Dienstleister.",
    tags: ["NAS", "Backup", "Storage"],
  },
  {
    category: "Arbeitsumgebung",
    title: "Apple- und Windows-Arbeitsplätze",
    desc: "Gemischte Arbeitsumgebung mit MacBooks und Windows-Workstations – einheitlich verwaltet und optimal vernetzt.",
    tags: ["Apple", "Windows", "Hybrid"],
  },
] as const;

export default function ServicesPage() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#e8eaed]">
        <div className="section py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="badge badge-info mb-5">
              IT-Systemhaus &amp; Managed Services
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#202124] leading-tight mb-5">
              IT-Lösungen für{" "}
              <span className="text-[#1a56db]">Unternehmen</span>
            </h1>
            <p className="text-lg text-[#5f6368] leading-relaxed mb-8 max-w-2xl">
              Von Hardware über Netzwerke bis zur kompletten IT-Infrastruktur – ENVETRA unterstützt
              Unternehmen mit moderner und zuverlässiger IT.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/b2b" className="btn-primary px-6 py-3 text-base">
                Beratung anfragen <ArrowRight size={16} />
              </Link>
              <Link href="/beratung" className="btn-secondary px-6 py-3 text-base">
                Kontakt aufnehmen
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: "6+",   label: "Service-Bereiche" },
              { value: "B2B",  label: "Fokus Geschäftskunden" },
              { value: "∞",    label: "Herstellerunabhängig" },
              { value: "24h",  label: "Schnelle Reaktionszeit" },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <div className="text-2xl font-bold text-[#1a56db]">{s.value}</div>
                <div className="text-xs text-[#5f6368] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ──────────────────────────────────────────────── */}
      <section className="section py-14 md:py-20">
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] mb-3">
            Unsere Leistungen im Überblick
          </h2>
          <p className="text-[#5f6368] max-w-2xl">
            Alles aus einer Hand – von der Beratung über die Beschaffung bis zur laufenden
            Betreuung Ihrer IT-Infrastruktur.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="card-hover p-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: s.bg }}
                >
                  <Icon size={20} style={{ color: s.color }} />
                </div>
                <h3 className="font-bold text-[#202124] mb-2">{s.title}</h3>
                <p className="text-sm text-[#5f6368] leading-relaxed mb-4">{s.description}</p>
                <ul className="space-y-1.5">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#3c4043]">
                      <CheckCircle size={13} className="text-[#1a56db] flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── ADVANTAGES ─────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-[#e8eaed]">
        <div className="section py-14 md:py-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left */}
            <div className="mb-10 lg:mb-0">
              <div className="badge badge-info mb-5">Warum ENVETRA</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] mb-4 leading-tight">
                Ihr zuverlässiger Partner für{" "}
                <span className="text-[#1a56db]">Business IT</span>
              </h2>
              <p className="text-[#5f6368] leading-relaxed mb-8">
                Wir verbinden Produktkompetenz mit echtem Service – für eine IT,
                die zuverlässig läuft und mit Ihrem Unternehmen wächst.
              </p>
              <Link href="/b2b" className="btn-primary px-6 py-3">
                Gespräch vereinbaren <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right – advantage cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ADVANTAGES.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="card p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#eff4ff] flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[#1a56db]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#202124] mb-0.5">{a.title}</div>
                      <div className="text-xs text-[#5f6368] leading-relaxed">{a.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ─────────────────────────────────────────────────────── */}
      <section className="section py-14 md:py-20">
        <div className="mb-10">
          <div className="badge badge-info mb-5">Beispielprojekte</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202124] mb-3">
            So unterstützt ENVETRA Unternehmen
          </h2>
          <p className="text-[#5f6368] max-w-xl">
            Einblicke in typische IT-Projekte, die wir für Unternehmen umsetzen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {SHOWCASE.map((p) => (
            <div key={p.title} className="card overflow-hidden">
              <div className="h-1 bg-[#1a56db]" />
              <div className="p-6">
                <div className="text-[11px] font-bold text-[#1a56db] uppercase tracking-wider mb-2">
                  {p.category}
                </div>
                <h3 className="font-bold text-[#202124] mb-2">{p.title}</h3>
                <p className="text-sm text-[#5f6368] leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span key={tag} className="badge badge-neutral text-[11px]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#1a56db]">
        <div className="section py-16 md:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Sie planen ein IT-Projekt?
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Ob Neuaufbau, Modernisierung oder laufende Betreuung – sprechen Sie
            mit uns. Wir analysieren Ihren Bedarf und entwickeln die passende Lösung.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/b2b"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#1a56db] font-bold rounded-md text-base hover:bg-blue-50 transition-colors"
            >
              Jetzt unverbindlich anfragen <ArrowRight size={16} />
            </Link>
            <Link
              href="/beratung"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold rounded-md text-base hover:bg-white/20 transition-colors"
            >
              Kaufberatung
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
