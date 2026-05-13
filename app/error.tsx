"use client";

// app/error.tsx

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-950">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-900/50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-100 mb-2">Etwas ist schiefgelaufen</h1>
        <p className="text-slate-400 text-sm mb-6">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-slate-600 mb-6">Fehler-ID: {error.digest}</p>
        )}
        <button onClick={reset} className="btn-primary">
          <RotateCcw size={15} />
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
