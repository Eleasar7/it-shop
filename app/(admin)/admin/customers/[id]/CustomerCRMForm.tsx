"use client";

import { useActionState, useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2 } from "lucide-react";
import { updateCustomerCRM } from "@/app/actions/customers";

const B2B_STATUSES = [
  { value: "NONE",     label: "Kein B2B" },
  { value: "PROSPECT", label: "Interessent" },
  { value: "ACTIVE",   label: "Aktiver B2B-Kunde" },
  { value: "INACTIVE", label: "Inaktiv" },
];

interface Props {
  customerId: string;
  initialData: {
    company: string; phone: string; vatId: string;
    b2bStatus: string; tags: string; internalNotes: string;
  };
}

export function CustomerCRMForm({ customerId, initialData }: Props) {
  const bound = updateCustomerCRM.bind(null, customerId);
  const [state, formAction, isPending] = useActionState(bound, {});
  const [data, setData] = useState(initialData);

  const set = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-slate-200 text-sm">CRM-Felder</h3>
      {state.success && (
        <div className="flex items-center gap-2 text-green-400 text-xs p-2 rounded-lg bg-green-950/30 border border-green-500/20">
          <CheckCircle2 size={12} /> Gespeichert
        </div>
      )}
      <form action={formAction} className="space-y-3">
        {[
          { key: "company", label: "Firma",     placeholder: "Musterfirma GmbH" },
          { key: "phone",   label: "Telefon",   placeholder: "+49 711 …" },
          { key: "vatId",   label: "USt.-ID",   placeholder: "DE123456789" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-slate-500 mb-1 font-medium">{label}</label>
            <input name={key} value={data[key as keyof typeof data]} onChange={set(key as any)}
              placeholder={placeholder} className="input text-sm" />
          </div>
        ))}

        <div>
          <label className="block text-xs text-slate-500 mb-1 font-medium">B2B-Status</label>
          <select name="b2bStatus" value={data.b2bStatus} onChange={set("b2bStatus")} className="input text-sm">
            {B2B_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1 font-medium">Tags (kommagetrennt)</label>
          <input name="tags" value={data.tags} onChange={set("tags")}
            placeholder="vip, reseller, premium" className="input text-sm" />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1 font-medium">Interne Notiz</label>
          <textarea name="internalNotes" value={data.internalNotes} onChange={set("internalNotes")}
            rows={3} className="input text-sm resize-none" placeholder="Nur für Admins…" />
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full py-2.5 text-sm">
          {isPending ? <><Loader2 size={13} className="animate-spin" /> Speichert…</> : <><Save size={13} /> Speichern</>}
        </button>
      </form>
    </div>
  );
}
