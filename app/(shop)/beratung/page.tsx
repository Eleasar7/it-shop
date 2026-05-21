"use client";

// app/(shop)/beratung/page.tsx
// Premium Smart IT Advisor — full redesign

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Monitor, Gamepad2, Briefcase, GraduationCap, Smartphone, Network,
  ArrowRight, ArrowLeft, CheckCircle2, Building2, Phone, ChevronRight,
  RefreshCcw, Zap, Star, Shield, Cpu, Server,
  Package, Laptop, Wifi,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = "use_case" | "budget" | "condition" | "brand" | "quantity" | "result";

interface Answers {
  useCase?: string;
  budget?: string;
  condition?: string;
  brand?: string;
  quantity?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    id: "office",
    label: "Büro & Produktivität",
    icon: Monitor,
    sub: "E-Mail, Office, Video-Calls",
    cats: ["laptops", "tablets"],
    color: "#1a56db",
    bg: "#eff4ff",
  },
  {
    id: "gaming",
    label: "Gaming",
    icon: Gamepad2,
    sub: "Spiele, Streaming, Unterhaltung",
    cats: ["laptops"],
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    id: "business",
    label: "Business & Unternehmen",
    icon: Briefcase,
    sub: "Mehrere Geräte, IT-Management",
    cats: ["laptops", "netzwerk", "zubehoer"],
    color: "#0369a1",
    bg: "#f0f9ff",
  },
  {
    id: "school",
    label: "Schule & Studium",
    icon: GraduationCap,
    sub: "Lernen, Notizen, Präsentationen",
    cats: ["tablets", "laptops"],
    color: "#059669",
    bg: "#ecfdf5",
  },
  {
    id: "smartphone",
    label: "Neues Smartphone",
    icon: Smartphone,
    sub: "Fotos, Social Media, Apps",
    cats: ["smartphones"],
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    id: "network",
    label: "Netzwerk & IT-Setup",
    icon: Network,
    sub: "Router, Server, Infrastruktur",
    cats: ["netzwerk", "it-services"],
    color: "#d97706",
    bg: "#fffbeb",
  },
];

const BUDGETS = [
  { id: "under500",   label: "Bis 500 €",        sub: "Einstieg & Alltag",       icon: "💰" },
  { id: "500to1000",  label: "500 – 1.000 €",    sub: "Solide Mittelklasse",     icon: "💼" },
  { id: "1000to2000", label: "1.000 – 2.000 €",  sub: "Premium-Bereich",         icon: "⭐" },
  { id: "over2000",   label: "Über 2.000 €",     sub: "High-End & Professional", icon: "🏆" },
];

const CONDITIONS = [
  {
    id: "new",
    label: "Neuware",
    sub: "Original verpackt, volle Herstellergarantie",
    icon: Package,
    badge: "Empfohlen",
  },
  {
    id: "refurb",
    label: "Refurbished",
    sub: "Generalüberholt, geprüft, bis 40% günstiger",
    icon: RefreshCcw,
    badge: "Beste Preis-Leistung",
  },
  {
    id: "both",
    label: "Beides okay",
    sub: "Hauptsache optimales Preis-Leistungs-Verhältnis",
    icon: Star,
    badge: null,
  },
];

const BRANDS = [
  { id: "apple",   label: "Apple",            icon: Laptop,  sub: "Premium Design & Ökosystem" },
  { id: "lenovo",  label: "Lenovo",           icon: Laptop,  sub: "Business & ThinkPad Serie" },
  { id: "samsung", label: "Samsung",          icon: Smartphone, sub: "Display & Smartphones" },
  { id: "any",     label: "Keine Präferenz",  icon: Package, sub: "Bestes Angebot zählt" },
];

const QUANTITIES = [
  { id: "1",   label: "1 Gerät",            sub: "Für mich persönlich",     icon: "👤" },
  { id: "2-4", label: "2 – 4 Geräte",       sub: "Kleines Team oder Familie", icon: "👥" },
  { id: "5+",  label: "5+ Geräte",          sub: "Business / B2B-Großorder", icon: "🏢" },
];

const STEPS: StepId[] = ["use_case", "budget", "condition", "brand", "quantity", "result"];

const STEP_LABELS: Record<StepId, string> = {
  use_case: "Verwendungszweck",
  budget: "Budget",
  condition: "Zustand",
  brand: "Marke",
  quantity: "Menge",
  result: "Empfehlung",
};

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

  const recommendations = cats.map((cat) => {
    const params = new URLSearchParams();
    params.set("category", cat);
    if (answers.brand && answers.brand !== "any") params.set("brand", answers.brand);
    return {
      title: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " "),
      description: `Passende ${cat} für dein Profil`,
      href: `/products?${params.toString()}`,
    };
  });

  return { mainHref, showB2B, recommendations, useCase };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressStepper({ currentStep }: { currentStep: StepId }) {
  const steps: StepId[] = ["use_case", "budget", "condition", "brand", "quantity"];
  const idx = steps.indexOf(currentStep);
  const pct = currentStep === "result" ? 100 : ((idx + 1) / steps.length) * 100;

  return (
    <div className="mb-8">
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500">
          {currentStep === "result" ? "Fertig!" : `Schritt ${idx + 1} von ${steps.length}`}
        </span>
        <span className="text-xs font-bold text-[#1a56db]">{Math.round(pct)}%</span>
      </div>
      {/* Bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #1a56db, #38bdf8)",
          }}
        />
      </div>
      {/* Step dots */}
      <div className="flex items-center justify-between mt-3">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-col items-center gap-1">
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: i <= idx || currentStep === "result" ? "#1a56db" : "#e2e8f0",
              }}
            />
            <span className="text-[9px] text-gray-400 hidden sm:block font-medium">
              {STEP_LABELS[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border-2 transition-all duration-200 active:scale-[0.98]"
      style={{
        borderColor: selected ? "#1a56db" : "#e2e8f0",
        background: selected ? "#eff4ff" : "white",
        boxShadow: selected ? "0 0 0 4px rgba(26,86,219,0.08)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Weiter",
  isLast = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  nextLabel?: string;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#e2e8f0] bg-white text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Zurück</span>
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#1a56db]/20 active:scale-[0.98]"
        style={{
          background: nextDisabled
            ? "#94a3b8"
            : isLast
            ? "linear-gradient(135deg, #059669, #047857)"
            : "linear-gradient(135deg, #1a56db, #1e40af)",
        }}
      >
        {nextLabel}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BeratungPage() {
  const [step, setStep] = useState<StepId>("use_case");
  const [answers, setAnswers] = useState<Answers>({});

  const set = useCallback((key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const next = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }, [step]);

  const back = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }, [step]);

  const reset = useCallback(() => {
    setAnswers({});
    setStep("use_case");
  }, []);

  const result = step === "result" ? buildResult(answers) : null;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">

      {/* ── HERO HEADER ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b3e 60%, #0f172a 100%)",
          paddingTop: step === "use_case" ? "clamp(48px, 8vw, 80px)" : "32px",
          paddingBottom: step === "use_case" ? "clamp(48px, 8vw, 80px)" : "32px",
        }}
      >
        {/* Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glow */}
        <div
          className="absolute -top-20 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(26,86,219,0.2) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-400/20 bg-blue-400/10 mb-5">
            <Zap size={12} className="text-amber-400" />
            <span className="text-xs font-bold text-blue-300 tracking-wider uppercase">Smart IT Advisor</span>
          </div>

          {step === "use_case" ? (
            <>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                Welches Gerät{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, #60a5fa, #38bdf8)" }}>
                  passt zu dir?
                </span>
              </h1>
              <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                In 5 kurzen Fragen zur perfekten Hardware-Empfehlung.
                Kostenlos, sofort, ohne Anmeldung.
              </p>

              {/* Trust mini-badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                {[
                  { icon: Shield, text: "Unabhängige Beratung" },
                  { icon: Zap, text: "Sofort-Empfehlung" },
                  { icon: Phone, text: "Persönlicher Support" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Icon size={12} className="text-[#60a5fa]" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </>
          ) : step === "result" ? (
            <>
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-green-500/10 border border-green-400/20 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-green-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Deine Empfehlung ist bereit!
              </h1>
              <p className="text-sm text-slate-400">
                Basierend auf deinen Angaben haben wir die besten Produkte für dich gefunden.
              </p>
            </>
          ) : (
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {STEP_LABELS[step]}
            </h1>
          )}
        </div>
      </div>

      {/* ── WIZARD CARD ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-lg overflow-hidden">

          {/* Progress */}
          {step !== "result" && (
            <div className="px-6 pt-6 pb-0">
              <ProgressStepper currentStep={step} />
            </div>
          )}

          <div className="px-6 py-6 space-y-5">

            {/* ── STEP: Use Case ── */}
            {step === "use_case" && (
              <div>
                <h2 className="text-base font-black text-gray-900 mb-4">
                  Wofür brauchst du das Gerät?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {USE_CASES.map(({ id, label, icon: Icon, sub, color, bg }) => (
                    <OptionCard
                      key={id}
                      selected={answers.useCase === id}
                      onClick={() => set("useCase", id)}
                    >
                      <div className="p-4 flex flex-col gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: answers.useCase === id ? color + "22" : bg,
                          }}
                        >
                          <Icon
                            size={20}
                            style={{ color: answers.useCase === id ? color : color + "99" }}
                          />
                        </div>
                        <div>
                          <p
                            className="text-sm font-bold leading-tight"
                            style={{ color: answers.useCase === id ? color : "#1f2937" }}
                          >
                            {label}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1 leading-snug">{sub}</p>
                        </div>
                        {answers.useCase === id && (
                          <CheckCircle2 size={14} style={{ color }} className="self-end -mt-1" />
                        )}
                      </div>
                    </OptionCard>
                  ))}
                </div>
                <div className="pt-2">
                  <NavButtons
                    onNext={next}
                    nextDisabled={!answers.useCase}
                  />
                </div>
              </div>
            )}

            {/* ── STEP: Budget ── */}
            {step === "budget" && (
              <div>
                <h2 className="text-base font-black text-gray-900 mb-4">
                  Welches Budget hast du?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {BUDGETS.map(({ id, label, sub, icon }) => (
                    <OptionCard
                      key={id}
                      selected={answers.budget === id}
                      onClick={() => set("budget", id)}
                    >
                      <div className="p-4 flex flex-col gap-2">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-snug">{label}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                        </div>
                        {answers.budget === id && (
                          <CheckCircle2 size={14} className="text-[#1a56db] self-end" />
                        )}
                      </div>
                    </OptionCard>
                  ))}
                </div>
                <div className="pt-2">
                  <NavButtons
                    onBack={back}
                    onNext={next}
                    nextDisabled={!answers.budget}
                  />
                </div>
              </div>
            )}

            {/* ── STEP: Condition ── */}
            {step === "condition" && (
              <div>
                <h2 className="text-base font-black text-gray-900 mb-4">
                  Neuware oder Refurbished?
                </h2>
                <div className="space-y-3">
                  {CONDITIONS.map(({ id, label, sub, icon: Icon, badge }) => (
                    <OptionCard
                      key={id}
                      selected={answers.condition === id}
                      onClick={() => set("condition", id)}
                    >
                      <div className="p-4 flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            background: answers.condition === id ? "#eff4ff" : "#f8f9fa",
                          }}
                        >
                          <Icon
                            size={20}
                            className={answers.condition === id ? "text-[#1a56db]" : "text-gray-400"}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-bold ${answers.condition === id ? "text-[#1a56db]" : "text-gray-800"}`}>
                              {label}
                            </p>
                            {badge && (
                              <span className="text-[9px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                          style={{
                            borderColor: answers.condition === id ? "#1a56db" : "#d1d5db",
                            background: answers.condition === id ? "#1a56db" : "transparent",
                          }}
                        >
                          {answers.condition === id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </OptionCard>
                  ))}
                </div>
                <div className="pt-2">
                  <NavButtons
                    onBack={back}
                    onNext={next}
                    nextDisabled={!answers.condition}
                  />
                </div>
              </div>
            )}

            {/* ── STEP: Brand ── */}
            {step === "brand" && (
              <div>
                <h2 className="text-base font-black text-gray-900 mb-4">
                  Hast du eine Markenpräferenz?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {BRANDS.map(({ id, label, icon: Icon, sub }) => (
                    <OptionCard
                      key={id}
                      selected={answers.brand === id}
                      onClick={() => set("brand", id)}
                    >
                      <div className="p-4 flex flex-col gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: answers.brand === id ? "#eff4ff" : "#f8f9fa",
                          }}
                        >
                          <Icon size={18} className={answers.brand === id ? "text-[#1a56db]" : "text-gray-400"} />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${answers.brand === id ? "text-[#1a56db]" : "text-gray-800"}`}>
                            {label}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                        </div>
                        {answers.brand === id && (
                          <CheckCircle2 size={13} className="text-[#1a56db] self-end" />
                        )}
                      </div>
                    </OptionCard>
                  ))}
                </div>
                <div className="pt-2">
                  <NavButtons
                    onBack={back}
                    onNext={next}
                    nextDisabled={!answers.brand}
                  />
                </div>
              </div>
            )}

            {/* ── STEP: Quantity ── */}
            {step === "quantity" && (
              <div>
                <h2 className="text-base font-black text-gray-900 mb-4">
                  Wie viele Geräte benötigst du?
                </h2>
                <div className="space-y-3">
                  {QUANTITIES.map(({ id, label, sub, icon }) => (
                    <OptionCard
                      key={id}
                      selected={answers.quantity === id}
                      onClick={() => set("quantity", id)}
                    >
                      <div className="p-4 flex items-center gap-4">
                        <span className="text-2xl">{icon}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${answers.quantity === id ? "text-[#1a56db]" : "text-gray-800"}`}>
                            {label}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                        </div>
                        {answers.quantity === id ? (
                          <CheckCircle2 size={18} className="text-[#1a56db] flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                        )}
                      </div>
                    </OptionCard>
                  ))}
                </div>
                <div className="pt-2">
                  <NavButtons
                    onBack={back}
                    onNext={next}
                    nextDisabled={!answers.quantity}
                    nextLabel="Empfehlungen anzeigen"
                    isLast
                  />
                </div>
              </div>
            )}

            {/* ── RESULT ── */}
            {step === "result" && result && (
              <div className="space-y-4 animate-fade-in">

                {/* Answers summary chips */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-[#f1f5f9]">
                  {[
                    { k: "Nutzung", v: USE_CASES.find(u => u.id === answers.useCase)?.label },
                    { k: "Budget", v: BUDGETS.find(b => b.id === answers.budget)?.label },
                    { k: "Zustand", v: CONDITIONS.find(c => c.id === answers.condition)?.label },
                    { k: "Marke", v: BRANDS.find(b => b.id === answers.brand)?.label },
                    { k: "Menge", v: QUANTITIES.find(q => q.id === answers.quantity)?.label },
                  ].filter(x => x.v).map(({ k, v }) => (
                    <div key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f1f5f9] border border-[#e2e8f0]">
                      <span className="text-[10px] text-gray-400 font-medium">{k}:</span>
                      <span className="text-[10px] text-gray-700 font-bold">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Main recommendation card */}
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Deine Top-Empfehlung
                  </p>
                  <Link
                    href={result.mainHref}
                    className="group flex items-center gap-4 p-5 rounded-xl border-2 border-[#1a56db] bg-[#eff4ff] hover:bg-[#e0ebff] transition-all duration-200 hover:shadow-lg hover:shadow-[#1a56db]/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#1a56db] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {result.useCase?.icon && (
                        <result.useCase.icon size={22} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[#1a56db] text-base">
                        {result.useCase?.label ?? "Passende Produkte"}
                      </p>
                      <p className="text-sm text-[#1a56db]/70 mt-0.5">
                        Gefiltert nach Budget &amp; Präferenzen
                      </p>
                    </div>
                    <ArrowRight size={18} className="text-[#1a56db] flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Additional categories */}
                {result.recommendations.length > 1 && (
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Weitere passende Kategorien
                    </p>
                    <div className="space-y-2">
                      {result.recommendations.slice(1).map((rec) => (
                        <Link
                          key={rec.href}
                          href={rec.href}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-[#e2e8f0] bg-white hover:border-[#1a56db] hover:bg-[#eff4ff] transition-all group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1a56db]">{rec.title}</p>
                            <p className="text-xs text-gray-500">{rec.description}</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-400 group-hover:text-[#1a56db] transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* B2B upsell */}
                {result.showB2B && (
                  <div
                    className="rounded-xl p-5"
                    style={{ background: "linear-gradient(135deg, #0a0e1a, #0d1b3e)" }}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <Building2 size={18} className="text-[#60a5fa] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">B2B-Anfrage empfohlen</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Für 5+ Geräte bieten wir Mengenrabatte, persönliche Beratung und flexible Zahlungskonditionen.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <Link
                        href="/b2b"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-[#0d1b3e] text-sm bg-white hover:bg-blue-50 transition-colors"
                      >
                        B2B-Anfrage stellen <ArrowRight size={14} />
                      </Link>
                      <a
                        href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <Phone size={13} /> Direkt anrufen
                      </a>
                    </div>
                  </div>
                )}

                {/* Personal consulting */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-[#e2e8f0] bg-[#f8f9fa]">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center flex-shrink-0">
                    <Phone size={16} className="text-[#1a56db]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">Persönliche Beratung gewünscht?</p>
                    <p className="text-xs text-gray-500">{siteConfig.businessHours} · {siteConfig.phone}</p>
                  </div>
                  <a
                    href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#e2e8f0] bg-white text-sm font-semibold text-gray-700 hover:border-[#1a56db] hover:text-[#1a56db] transition-all flex-shrink-0"
                  >
                    Anrufen
                  </a>
                </div>

                {/* Reset */}
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mx-auto pt-2"
                >
                  <RefreshCcw size={13} /> Neu starten
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Why use advisor — below card, only on first step */}
        {step === "use_case" && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Zap,     title: "5 Minuten",        sub: "Schnelle Analyse" },
              { icon: Shield,  title: "Neutral",           sub: "Keine Werbung" },
              { icon: Star,    title: "Personalisiert",    sub: "Dein Profil zählt" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex flex-col items-center gap-2 py-4 px-2 bg-white rounded-xl border border-[#e2e8f0] text-center">
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center">
                  <Icon size={15} className="text-[#1a56db]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{title}</p>
                  <p className="text-[10px] text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
