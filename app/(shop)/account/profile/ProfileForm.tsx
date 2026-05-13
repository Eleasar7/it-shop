"use client";

// app/(shop)/account/profile/ProfileForm.tsx

import { useState } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  initialData: { name: string; phone: string; company: string };
}

export function ProfileForm({ initialData }: Props) {
  const [form, setForm] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler beim Speichern");
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 space-y-5">
      <h2 className="font-semibold text-slate-200 text-sm">Daten aktualisieren</h2>

      {success && (
        <div className="flex items-center gap-2 text-green-400 text-sm p-3 rounded-lg bg-green-950/30 border border-green-500/20 animate-fade-in">
          <CheckCircle2 size={15} /> Profil erfolgreich gespeichert
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-950/30 border border-red-500/20">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Max Mustermann"
              className="input"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Telefon
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+49 711 …"
              className="input"
              autoComplete="tel"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Unternehmen <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="Firmenname GmbH"
              className="input"
              autoComplete="organization"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Wird gespeichert…</>
          ) : (
            <><Save size={14} /> Speichern</>
          )}
        </button>
      </form>
    </div>
  );
}
