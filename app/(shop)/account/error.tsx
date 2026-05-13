"use client";

// app/(shop)/account/error.tsx
// Catches runtime errors in /account/* and shows a user-friendly message.

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AccountError]", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-900/40 flex items-center justify-center mx-auto">
        <AlertTriangle size={28} className="text-red-400" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-100">Etwas ist schiefgelaufen</h1>
        <p className="text-slate-400 text-sm mt-2">
          Dein Konto konnte nicht geladen werden. Bitte versuche es erneut.
        </p>
        {error.digest && (
          <p className="text-slate-600 text-xs mt-2 font-mono">
            Fehler-ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="btn-primary">
          <RefreshCw size={14} /> Erneut versuchen
        </button>
        <Link href="/" className="btn-secondary">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
