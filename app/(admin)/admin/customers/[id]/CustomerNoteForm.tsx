"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { addCustomerNote } from "@/app/actions/customers";

export function CustomerNoteForm({ customerId, adminId }: { customerId: string; adminId: string }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addCustomerNote(customerId, content, adminId);
      if (result.success) {
        setContent("");
      } else {
        setError(result.error ?? "Fehler");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="input text-sm resize-none w-full"
        placeholder="Neue Notiz hinzufügen (intern, nicht für Kunden sichtbar)…"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" disabled={isPending || !content.trim()} className="btn-secondary text-sm">
        {isPending ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        Notiz hinzufügen
      </button>
    </form>
  );
}
