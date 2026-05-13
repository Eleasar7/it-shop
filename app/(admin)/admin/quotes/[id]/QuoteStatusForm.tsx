"use client";

import { useActionState, useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { updateQuoteStatus } from "@/app/actions/quotes";

const STATUSES = [
  { value: "DRAFT",    label: "Entwurf" },
  { value: "SENT",     label: "Gesendet" },
  { value: "ACCEPTED", label: "Akzeptiert" },
  { value: "REJECTED", label: "Abgelehnt" },
  { value: "EXPIRED",  label: "Abgelaufen" },
];

interface Props {
  quoteId: string;
  currentStatus: string;
  currentAdminNotes: string;
}

export function QuoteStatusForm({ quoteId, currentStatus, currentAdminNotes }: Props) {
  const bound = updateQuoteStatus.bind(null, quoteId);
  const [state, formAction, isPending] = useActionState(bound, {});
  const [status, setStatus]     = useState(currentStatus);
  const [notes,  setNotes]      = useState(currentAdminNotes);

  useEffect(() => { setStatus(currentStatus); },    [currentStatus]);
  useEffect(() => { setNotes(currentAdminNotes); }, [currentAdminNotes]);

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-slate-200 text-sm">Status verwalten</h3>

      {state.success && (
        <div className="flex items-center gap-2 text-green-400 text-xs p-2.5 rounded-lg bg-green-950/30 border border-green-500/20">
          <CheckCircle2 size={13} /> Gespeichert
        </div>
      )}
      {state.error && (
        <div className="flex items-center gap-2 text-red-400 text-xs p-2.5 rounded-lg bg-red-950/30 border border-red-500/20">
          <AlertCircle size={13} /> {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="status" value={status} />
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input text-sm">
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Interne Notiz</label>
          <textarea name="adminNotes" value={notes} onChange={(e) => setNotes(e.target.value)}
            rows={4} className="input text-sm resize-none" placeholder="Verhandlungsstand…" />
        </div>
        <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5 text-sm">
          {isPending ? <><Loader2 size={14} className="animate-spin" /> Speichert…</> : <><Save size={14} /> Speichern</>}
        </button>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: "→ Gesendet",   value: "SENT" },
            { label: "→ Akzeptiert", value: "ACCEPTED" },
          ].map(({ label, value }) => (
            <button key={value} type="button" onClick={() => setStatus(value)}
              className={`btn-secondary text-xs py-1.5 justify-center ${status === value ? "border-indigo-500/40 text-indigo-400" : ""}`}>
              {label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
