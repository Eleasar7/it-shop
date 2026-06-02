"use client";

// app/(shop)/login/page.tsx

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validations";

// useSearchParams requires a Suspense boundary in Next.js 14+
// We split the form into its own component so Suspense wraps only what needs it.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/account";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Ungültige Eingabe");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? "E-Mail oder Passwort falsch."
            : "Anmeldung fehlgeschlagen. Bitte versuche es erneut."
        );
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Netzwerkfehler. Bitte prüfe deine Verbindung.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400 text-sm animate-fade-in">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            E-Mail-Adresse
          </label>
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">Passwort</label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#1a56db] hover:text-indigo-300 transition-colors"
            >
              Vergessen?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              className="input pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Anmelden
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="card p-6 space-y-5 animate-pulse">
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-10 bg-gray-100 rounded-lg" />
      <div className="h-11 bg-gray-100 rounded-lg" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#f8f9fa]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.1),transparent)] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
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
          <h1 className="text-2xl font-bold text-gray-900">Willkommen zurück</h1>
          <p className="text-gray-600 text-sm mt-1">Melde dich in deinem Konto an</p>
        </div>

        {/* FIX: Wrap in Suspense so useSearchParams doesn't de-opt the whole page */}
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-gray-600 mt-6">
          Noch kein Konto?{" "}
          <Link
            href="/register"
            className="text-[#1a56db] hover:text-indigo-300 font-medium transition-colors"
          >
            Jetzt registrieren
          </Link>
        </p>
      </div>
    </div>
  );
}
