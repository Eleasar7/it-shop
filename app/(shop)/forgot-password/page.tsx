"use client";

// app/(shop)/forgot-password/page.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, AlertCircle, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">E-Mail gesendet</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Wir haben einen Link zum Zurücksetzen deines Passworts an{" "}
            <strong className="text-slate-200">{email}</strong> gesendet. Bitte prüfe
            auch deinen Spam-Ordner.
          </p>
          <Link href="/login" className="btn-secondary inline-flex">
            Zurück zum Login
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
          <h1 className="text-2xl font-bold text-slate-100">Passwort vergessen?</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gib deine E-Mail ein – wir schicken dir einen Reset-Link.
          </p>
        </div>

        <div className="card p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@beispiel.de"
                className="input"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Reset-Link senden <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mt-6"
        >
          <ChevronLeft size={15} /> Zurück zum Login
        </Link>
      </div>
    </div>
  );
}
