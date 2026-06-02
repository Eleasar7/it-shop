"use client";

// app/(shop)/register/page.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Ungültige Eingabe");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { name: parsed.data.name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setError(
          authError.message.includes("already registered")
            ? "Diese E-Mail ist bereits registriert."
            : authError.message
        );
        return;
      }

      // User in unserer DB anlegen (via API Route)
      if (data.user) {
        await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.user.id,
            email: parsed.data.email,
            name: parsed.data.name,
          }),
        });
      }

      // Wenn E-Mail-Bestätigung deaktiviert → direkt einloggen
      if (data.session) {
        router.push("/account");
        router.refresh();
      } else {
        setSuccess(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabel = ["Sehr schwach", "Schwach", "Mittel", "Stark"][strength ? strength - 1 : 0];
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"][strength ? strength - 1 : 0];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#f8f9fa]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">E-Mail bestätigen</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Wir haben dir einen Bestätigungslink an <strong className="font-semibold text-gray-900">{form.email}</strong> gesendet. Bitte prüfe dein Postfach.
          </p>
          <Link href="/login" className="btn-secondary mt-6 inline-flex">
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Envetra"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">Konto erstellen</h1>
          <p className="text-slate-400 text-sm mt-1">Schnell und kostenlos registrieren</p>
        </div>

        <div className="card p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm animate-fade-in">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
              <input
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Max Mustermann"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">E-Mail-Adresse</label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="name@beispiel.de"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Passwort</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Mindestens 8 Zeichen"
                  className="input pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Stärke-Anzeige */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength && i <= strength ? strengthColor : "bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strengthLabel}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Konto erstellen <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center">
            Mit der Registrierung stimmst du unseren{" "}
            <Link href="/agb" className="text-indigo-400 hover:underline">AGB</Link> und der{" "}
            <Link href="/datenschutz" className="text-indigo-400 hover:underline">Datenschutzerklärung</Link> zu.
          </p>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Bereits registriert?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Jetzt anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
