"use client";

// app/(shop)/b2b/page.tsx

import { useState } from "react";
import { Building2, Send, CheckCircle, Plus, Trash2, AlertCircle } from "lucide-react";
import { b2bRequestSchema } from "@/lib/validations";

interface RequestItem { productName: string; quantity: number; notes: string }

export default function B2BPage() {
  const [form, setForm] = useState({
    companyName: "", contactName: "", email: "", phone: "", message: "",
  });
  const [items, setItems] = useState<RequestItem[]>([{ productName: "", quantity: 1, notes: "" }]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => setItems((i) => [...i, { productName: "", quantity: 1, notes: "" }]);
  const removeItem = (idx: number) => setItems((i) => i.filter((_, j) => j !== idx));
  const updateItem = (idx: number, field: keyof RequestItem, value: string | number) =>
    setItems((i) => i.map((item, j) => (j === idx ? { ...item, [field]: value } : item)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      ...form,
      items: items.filter((i) => i.productName.trim()),
    };

    const parsed = b2bRequestSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Bitte alle Pflichtfelder ausfüllen.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Fehler beim Senden. Bitte versuche es erneut.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Anfrage gesendet!</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Wir haben deine Anfrage erhalten und melden uns innerhalb von 24 Stunden per E-Mail bei dir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium mb-4">
          <Building2 size={12} /> Firmenkunden & Großmengen
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Firmenanfrage stellen</h1>
        <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
          Du benötigst Hardware in größeren Mengen, spezielle Konfigurationen oder individuelle Preise? Wir beraten dich gerne.
        </p>
      </div>

      {/* Vorteile */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Mengenrabatt", sub: "ab 5 Geräten" },
          { label: "Persönlicher Ansprechpartner", sub: "dedizierter Account-Manager" },
          { label: "Flexible Zahlung", sub: "Rechnung, SEPA, Vorkasse" },
        ].map(({ label, sub }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <p className="text-xs text-gray-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Kontakt */}
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 text-base">Kontaktdaten</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unternehmen *</label>
              <input value={form.companyName} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                placeholder="Musterfirma GmbH" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ansprechpartner *</label>
              <input value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                placeholder="Max Mustermann" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail *</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="max@firma.de" className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+49 711 …" className="input" />
            </div>
          </div>
        </div>

        {/* Produkte */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-base">Gewünschte Produkte</h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <div className="flex-1 grid sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      value={item.productName}
                      onChange={(e) => updateItem(idx, "productName", e.target.value)}
                      placeholder="Produktname (z.B. iPhone 16 Pro 256 GB)"
                      className="input text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number" min={1} value={item.quantity}
                      onChange={(e) => updateItem(idx, "quantity", parseInt(e.target.value) || 1)}
                      placeholder="Menge" className="input text-sm w-20 flex-shrink-0"
                    />
                    <input
                      value={item.notes}
                      onChange={(e) => updateItem(idx, "notes", e.target.value)}
                      placeholder="Variante / Hinweis" className="input text-sm flex-1"
                    />
                  </div>
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-0.5">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-[#1a56db] hover:text-[#1043b2] transition-colors font-medium">
            <Plus size={14} /> Weiteres Produkt hinzufügen
          </button>
        </div>

        {/* Nachricht */}
        <div className="card p-6 space-y-3">
          <h2 className="font-semibold text-gray-900 text-base">Nachricht *</h2>
          <textarea
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Beschreibe dein Projekt, besondere Anforderungen, gewünschten Liefertermin oder Fragen zur Konfiguration…"
            rows={5} className="input resize-none" required minLength={20}
          />
          <p className="text-xs text-gray-500">{form.message.length} / 2000 Zeichen</p>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><Send size={16} /> Anfrage absenden</>
          )}
        </button>
        <p className="text-xs text-gray-500 text-center">
          Wir antworten innerhalb von 24 Stunden · Keine Verpflichtung
        </p>
      </form>
    </div>
  );
}
