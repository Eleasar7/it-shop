"use client";

// app/(shop)/beratung/page.tsx
// Guided buying wizard — helps customers find the right product.

import { useState, Suspense } from "react";
import Link from "next/link";
import {
  Monitor, Gamepad2, Briefcase, GraduationCap, Smartphone, Network,
  ArrowRight, ArrowLeft, CheckCircle2, Building2, Phone, ChevronRight,
  Lightbulb, RefreshCcw,
} from "lucide-react";
import type { Metadata } from "next";

// ─── Step definitions ─────────────────────────────────────────────────────────

type Step = "use_case" | "budget" | "condition" | "brand" | "quantity" | "result";

interface Answers {
  useCase?: string;
  budget?: string;
  condition?: string;
  brand?: string;
  quantity?: string;
}

const USE_CASES = [
  { id: "office",    label: "Büro & Produktivität",   icon: Monitor,     sub: "E-Mail, Office, Video-Calls",   cats: ["laptops", "tablets"] },
  { id: "gaming",    label: "Gaming",                 icon: Gamepad2,    sub: "Spiele, Streaming, Unterhaltung", cats: ["laptops"] },
  { id: "business",  label: "Business & Unternehmen", icon: Briefcase,   sub: "Mehrere Geräte, IT-Management",   cats: ["laptops", "netzwerk", "zubehoer"] },
  { id: "school",    label: "Schule & Studium",        icon: GraduationCap, sub: "Lernen, Notizen, Präsentationen", cats: ["tablets", "laptops"] },
  { id: "smartphone",label: "Neues Smartphone",       icon: Smartphone,  sub: "Fotos, Social Media, Kommunikation", cats: ["smartphones"] },
  { id: "network",   label: "Netzwerk & IT-Setup",    icon: Network,     sub: "Router, Server, Infrastruktur",    cats: ["netzwerk", "it-services"] },
];

const BUDGETS = [
  { id: "under500",  label: "Bis 500 €",   sub: "Einstieg & Alltag" },
  { id: "500to1000", label: "500 – 1.000 €", sub: "Solide Mittelklasse" },
  { id: "1000to2000",label: "1.000 – 2.000 €", sub: "Premium-Bereich" },
  { id: "over2000",  label: "Über 2.000 €",  sub: "High-End & Profi" },
];

const CONDITIONS = [
  { id: "new",       label: "Neuware",      sub: "Original verpackt, Herstellergarantie" },
  { id: "refurb",    label: "Refurbished",  sub: "Generalüberholt, geprüft, günstiger" },
  { id: "both",      label: "Beides okay",  sub: "Hauptsache gutes Preis-Leistungs-Verhältnis" },
];

const BRANDS = [
  { id: "apple",     label: "Apple" },
  { id: "samsung",   label: "Samsung" },
  { id: "lenovo",    label: "Lenovo" },
  { id: "any",       label: "Keine Präferenz" },
];

const QUANTITIES = [
  { id: "1",    label: "1 Gerät",             sub: "Für mich persönlich" },
  { id: "2-4",  label: "2 – 4 Geräte",        sub: "Kleines Team oder Familie" },
  { id: "5+",   label: "5 oder mehr Geräte",  sub: "Business / B2B" },
];

// ─── Result logic ─────────────────────────────────────────────────────────────

function buildResult(answers: Answers) {
  const useCase = USE_CASES.find((u) => u.id === answers.useCase);
  const cats = useCase?.cats ?? ["laptops"];

  const searchParams = new URLSearchParams();
  if (cats[0]) searchParams.set("category", cats[0]);

  const budget = answers.budget;
  if (budget === "under500") searchParams.set("maxPrice", "500");
  if (budget === "500to1000") { searchParams.set("minPrice", "500"); searchParams.set("maxPrice", "1000"); }
  if (budget === "1000to2000") { searchParams.set("minPrice", "1000"); searchParams.set("maxPrice", "2000"); }
  if (budget === "over2000") searchParams.set("minPrice", "2000");

  if (answers.brand && answers.brand !== "any") searchParams.set("brand", answers.brand);

  const mainHref = `/products?${searchParams.toString()}`;

  const showB2B = answers.quantity === "5+";

  const recommendations: Array<{ title: string; description: string; href: string }> = cats.map((cat) => {
    const params = new URLSearchParams();
    params.set("category", cat);
    if (answers.brand && answers.brand !== "any") params.set("brand", answers.brand);
    return {
      title: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " "),
      description: `Passende ${cat === "laptops" ? "Laptops" : cat === "smartphones" ? "Smartphones" : cat === "tablets" ? "Tablets" : "Produkte"} für dein Anwendungsprofil`,
      href: `/products?${params.toString()}`,
    };
  });

  return { mainHref, showB2B, recommendations, useCase };
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepCard({ selected, onClick, children }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-2xl transition-all duration-200"
      style={{
        background: selected ? "rgba(99,102,241,0.14)" : "rgb(var(--bg-elevated))",
        border: selected ? "2px solid rgba(99,102,241,0.45)" : "1px solid rgba(255,255,255,0.08)",
        boxShadow: selected ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function ProgressBar({ step }: { step: Step }) {
  const steps: Step[] = [
    "use_case",
    "budget",
    "condition",
    "brand",
    "quantity",
  ];

  const idx = steps.indexOf(step);
  const pct = idx < 0 ? 100 : ((idx + 1) / steps.length) * 100;  return (
    <div className="h-1.5 rounded-full overflow-hidden mb-8" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BeratungPage() {
  const [step, setStep] = useState<Step>("use_case");
  const [answers, setAnswers] = useState<Answers>({});

  const set = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => {
    const order: Step[] = ["use_case", "budget", "condition", "brand", "quantity", "result"];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  };

  const back = () => {
    const order: Step[] = ["use_case", "budget", "condition", "brand", "quantity", "result"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  };

  const reset = () => {
    setAnswers({});
    setStep("use_case");
  };

  const result = step === "result" ? buildResult(answers) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold text-indigo-300 uppercase tracking-widest"
          style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <Lightbulb size={12} /> Kaufberatung
        </div>
        <h1 className="text-3xl font-black text-slate-50 mb-2">
          Welches Gerät passt zu dir?
        </h1>
        <p className="text-slate-500 text-sm">
          Beantworte ein paar kurze Fragen – wir empfehlen das passende Produkt.
        </p>
      </div>

      {step !== "result" && <ProgressBar step={step} />}

      {/* Step: Use case */}
      {step === "use_case" && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-100 mb-5">
            Wofür brauchst du das Gerät?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {USE_CASES.map(({ id, label, icon: Icon, sub }) => (
              <StepCard
                key={id}
                selected={answers.useCase === id}
                onClick={() => { set("useCase", id); }}
              >
                <div className="flex flex-col gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: answers.useCase === id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <Icon size={18} className={answers.useCase === id ? "text-indigo-400" : "text-slate-500"} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold leading-snug ${answers.useCase === id ? "text-indigo-300" : "text-slate-300"}`}>
                      {label}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{sub}</p>
                  </div>
                </div>
              </StepCard>
            ))}
          </div>
          <button
            onClick={next}
            disabled={!answers.useCase}
            className="btn-primary w-full py-3 mt-4"
          >
            Weiter <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step: Budget */}
      {step === "budget" && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-100 mb-5">
            Welches Budget hast du?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {BUDGETS.map(({ id, label, sub }) => (
              <StepCard key={id} selected={answers.budget === id} onClick={() => set("budget", id)}>
                <p className={`text-base font-black ${answers.budget === id ? "text-indigo-300" : "text-slate-200"}`}>
                  {label}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
              </StepCard>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={back} className="btn-secondary flex-shrink-0">
              <ArrowLeft size={15} />
            </button>
            <button onClick={next} disabled={!answers.budget} className="btn-primary flex-1 py-3">
              Weiter <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Condition */}
      {step === "condition" && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-100 mb-5">
            Neuware oder Refurbished?
          </h2>
          <div className="space-y-3">
            {CONDITIONS.map(({ id, label, sub }) => (
              <StepCard key={id} selected={answers.condition === id} onClick={() => set("condition", id)}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      answers.condition === id
                        ? "border-indigo-500 bg-indigo-600"
                        : "border-slate-600"
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-bold ${answers.condition === id ? "text-indigo-300" : "text-slate-200"}`}>
                      {label}
                    </p>
                    <p className="text-xs text-slate-600">{sub}</p>
                  </div>
                </div>
              </StepCard>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={back} className="btn-secondary flex-shrink-0"><ArrowLeft size={15} /></button>
            <button onClick={next} disabled={!answers.condition} className="btn-primary flex-1 py-3">
              Weiter <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Brand */}
      {step === "brand" && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-100 mb-5">
            Hast du eine Markenpräferenz?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {BRANDS.map(({ id, label }) => (
              <StepCard key={id} selected={answers.brand === id} onClick={() => set("brand", id)}>
                <p className={`text-sm font-bold text-center py-1 ${answers.brand === id ? "text-indigo-300" : "text-slate-200"}`}>
                  {label}
                </p>
              </StepCard>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={back} className="btn-secondary flex-shrink-0"><ArrowLeft size={15} /></button>
            <button onClick={next} disabled={!answers.brand} className="btn-primary flex-1 py-3">
              Weiter <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Quantity */}
      {step === "quantity" && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-100 mb-5">
            Wie viele Geräte benötigst du?
          </h2>
          <div className="space-y-3">
            {QUANTITIES.map(({ id, label, sub }) => (
              <StepCard key={id} selected={answers.quantity === id} onClick={() => set("quantity", id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold ${answers.quantity === id ? "text-indigo-300" : "text-slate-200"}`}>
                      {label}
                    </p>
                    <p className="text-xs text-slate-600">{sub}</p>
                  </div>
                  {answers.quantity === id && <CheckCircle2 size={16} className="text-indigo-400 flex-shrink-0" />}
                </div>
              </StepCard>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={back} className="btn-secondary flex-shrink-0"><ArrowLeft size={15} /></button>
            <button
              onClick={() => { next(); }}
              disabled={!answers.quantity}
              className="btn-primary flex-1 py-3"
            >
              Empfehlungen anzeigen <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {step === "result" && result && (
        <div className="space-y-6 animate-fade-up">
          {/* Success banner */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200 mb-1">
                  Wir haben passende Empfehlungen für dich!
                </p>
                <p className="text-sm text-slate-400">
                  Basierend auf deinen Angaben zeigen wir dir die besten Produkte aus unserem Sortiment.
                </p>
              </div>
            </div>
          </div>

          {/* Main recommendation */}
          <div>
            <h2 className="text-base font-black text-slate-300 mb-3 uppercase tracking-wide text-xs">
              Deine Empfehlung
            </h2>
            <Link
              href={result.mainHref}
              className="block rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: "rgb(var(--bg-elevated))", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-black text-slate-100 text-base mb-1">
                    {result.useCase?.label ?? "Passende Produkte"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Gefiltert nach deinem Budget und deinen Präferenzen
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}
                >
                  <ChevronRight size={18} className="text-indigo-400" />
                </div>
              </div>
            </Link>
          </div>

          {/* Category recommendations */}
          {result.recommendations.length > 1 && (
            <div>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
                Weitere Kategorien
              </h2>
              <div className="space-y-2">
                {result.recommendations.slice(1).map((rec) => (
                  <Link
                    key={rec.href}
                    href={rec.href}
                    className="flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-white/[0.04]"
                    style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-300">{rec.title}</p>
                      <p className="text-xs text-slate-600">{rec.description}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* B2B CTA if 5+ */}
          {result.showB2B && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: "linear-gradient(135deg, rgba(15,16,38,1), rgba(22,22,52,0.9))",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <p className="font-bold text-slate-200 mb-1 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-400" />
                Business-Anfrage empfohlen
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Für 5+ Geräte bieten wir Mengenrabatte, persönliche Beratung und flexible Zahlungskonditionen.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/b2b" className="btn-primary text-sm">
                  B2B-Anfrage stellen <ArrowRight size={14} />
                </Link>
                <a href="tel:+4971112345467" className="btn-secondary text-sm">
                  <Phone size={14} /> Direkt anrufen
                </a>
              </div>
            </div>
          )}

          {/* Personal consulting CTA */}
          <div
            className="rounded-xl p-4 flex items-center gap-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Phone size={18} className="text-slate-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-300">Persönliche Beratung gewünscht?</p>
              <p className="text-xs text-slate-600">Mo–Fr 8–18 Uhr · +49 176 57719796</p>
            </div>
            <a href="tel:+4971112345467" className="btn-secondary text-xs px-3 py-2 flex-shrink-0">
              Anrufen
            </a>
          </div>

          {/* Start over */}
          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-400 transition-colors mx-auto"
          >
            <RefreshCcw size={13} /> Neu starten
          </button>
        </div>
      )}
    </div>
  );
}
