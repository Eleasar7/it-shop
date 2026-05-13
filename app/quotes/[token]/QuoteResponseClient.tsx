"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { customerRespondToQuote } from "@/app/actions/quotes";

export function QuoteResponseClient({ accessToken }: { accessToken: string }) {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [done,    setDone]    = useState<"accepted" | "rejected" | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const respond = async (response: "ACCEPTED" | "REJECTED") => {
    setLoading(response === "ACCEPTED" ? "accept" : "reject");
    setError(null);
    const result = await customerRespondToQuote(accessToken, response);
    setLoading(null);
    if (result.success) {
      setDone(response === "ACCEPTED" ? "accepted" : "rejected");
    } else {
      setError(result.error ?? "Fehler beim Verarbeiten.");
    }
  };

  if (done === "accepted") {
    return (
      <div className="card p-6 text-center space-y-3">
        <CheckCircle size={36} className="text-green-400 mx-auto" />
        <h2 className="font-bold text-slate-100 text-lg">Angebot akzeptiert!</h2>
        <p className="text-slate-400 text-sm">
          Wir haben Ihre Zustimmung erhalten und werden uns umgehend bei Ihnen melden.
        </p>
      </div>
    );
  }

  if (done === "rejected") {
    return (
      <div className="card p-6 text-center space-y-3">
        <XCircle size={36} className="text-red-400 mx-auto" />
        <h2 className="font-bold text-slate-100 text-lg">Angebot abgelehnt</h2>
        <p className="text-slate-400 text-sm">
          Wir haben Ihre Entscheidung erhalten. Bei Fragen stehen wir Ihnen gerne zur Verfügung.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-semibold text-slate-200">Auf dieses Angebot antworten</h2>
      {error && (
        <p className="text-red-400 text-sm p-3 bg-red-950/30 rounded-xl border border-red-500/20">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => respond("ACCEPTED")}
          disabled={loading !== null}
          className="btn-primary py-3.5 text-base justify-center"
        >
          {loading === "accept"
            ? <Loader2 size={17} className="animate-spin" />
            : <><CheckCircle size={17} /> Angebot akzeptieren</>}
        </button>
        <button
          onClick={() => respond("REJECTED")}
          disabled={loading !== null}
          className="btn-secondary py-3.5 text-base justify-center text-red-400 hover:text-red-300"
        >
          {loading === "reject"
            ? <Loader2 size={17} className="animate-spin" />
            : <><XCircle size={17} /> Ablehnen</>}
        </button>
      </div>
      <p className="text-xs text-slate-600 text-center">
        Ihre Antwort wird sofort übermittelt. Kein Konto erforderlich.
      </p>
    </div>
  );
}
