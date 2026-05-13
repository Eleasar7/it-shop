"use client";

import { useActionState, useState } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  action: (prev: any, fd: FormData) => Promise<any>;
  initialData?: {
    name?: string; contactName?: string | null; email?: string | null;
    phone?: string | null; website?: string | null; address?: string | null;
    notes?: string | null; isActive?: boolean;
  };
  submitLabel?: string;
}

export function SupplierForm({ action, initialData, submitLabel = "Speichern" }: Props) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <div className="card p-5 space-y-5">
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
        {[
          { name: "name",        label: "Name *",       required: true },
          { name: "contactName", label: "Ansprechpartner" },
          { name: "email",       label: "E-Mail",  type: "email" },
          { name: "phone",       label: "Telefon" },
          { name: "website",     label: "Website", type: "url" },
        ].map(({ name, label, type, required }) => (
          <div key={name}>
            <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
            <input name={name} type={type ?? "text"} required={required}
              defaultValue={(initialData as any)?.[name] ?? ""}
              className="input text-sm" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Adresse</label>
          <textarea name="address" rows={2} className="input text-sm resize-none"
            defaultValue={initialData?.address ?? ""} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Notizen</label>
          <textarea name="notes" rows={3} className="input text-sm resize-none"
            defaultValue={initialData?.notes ?? ""} />
        </div>
        <input type="hidden" name="isActive" value={String(initialData?.isActive ?? true)} />
        <button type="submit" disabled={isPending} className="btn-primary text-sm">
          {isPending ? <><Loader2 size={13} className="animate-spin" /> Speichert…</> : <><Save size={13} /> {submitLabel}</>}
        </button>
      </form>
    </div>
  );
}
