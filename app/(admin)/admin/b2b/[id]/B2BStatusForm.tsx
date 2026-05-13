"use client";

// app/(admin)/admin/b2b/[id]/B2BStatusForm.tsx

import { useActionState, useEffect, useState } from "react";
import { Save, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { updateB2BStatus } from "@/app/actions/b2b";

const STATUSES = [
  { value: "OPEN",      label: "Neu / Offen" },
  { value: "IN_REVIEW", label: "In Prüfung" },
  { value: "QUOTED",    label: "Angebot gesendet" },
  { value: "ACCEPTED",  label: "Gewonnen / Akzeptiert" },
  { value: "REJECTED",  label: "Abgelehnt" },
  { value: "CLOSED",    label: "Geschlossen" },
];

interface Props {
  requestId:        string;
  currentStatus:    string;
  currentAdminNotes: string;
}

export function B2BStatusForm({ requestId, currentStatus, currentAdminNotes }: Props) {
  const bound  = updateB2BStatus.bind(null, requestId);
  const [state, formAction, isPending] = useActionState(bound, {});
  const [status, setStatus] = useState(currentStatus);
  const [notes,  setNotes]  = useState(currentAdminNotes);

  useEffect(() => { setStatus(currentStatus);    }, [currentStatus]);
  useEffect(() => { setNotes(currentAdminNotes); }, [currentAdminNotes]);

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-slate-200 text-sm">Status verwalten</h3>

      {state.success && (
        <div className="flex items-center gap-2 text-green-400 text-xs p-2.5 rounded-lg bg-green-950/30 border border-green-500/20 animate-fade-in">
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
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            Interne Notiz
          </label>
          <textarea
            name="adminNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="input text-sm resize-none"
            placeholder="Angebotspreis, Verhandlungsstand, nächste Schritte…"
          />
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5 text-sm">
          {isPending
            ? <><Loader2 size={14} className="animate-spin" /> Speichert…</>
            : <><Save size={14} /> Speichern</>}
        </button>

        {/* Quick-action buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {[
            { label: "→ In Prüfung",  value: "IN_REVIEW" },
            { label: "→ Angebot sent.", value: "QUOTED" },
            { label: "→ Gewonnen",    value: "ACCEPTED" },
            { label: "→ Abgelehnt",   value: "REJECTED" },
          ].map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatus(value)}
              className={`btn-secondary text-xs py-1.5 justify-center ${
                status === value ? "border-indigo-500/40 text-indigo-400" : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
