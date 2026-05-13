"use client";

// app/(admin)/admin/products/DeleteButton.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function AdminDeleteProductButton({ productId }: { productId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); setTimeout(() => setConfirming(false), 3000); return; }
    setLoading(true);
    try {
      await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`p-1.5 rounded-lg text-sm transition-colors ${
        confirming
          ? "bg-red-600 text-white px-2.5"
          : "text-slate-400 hover:text-red-400 hover:bg-red-950/30"
      }`}
      title="Produkt löschen"
    >
      {confirming ? "Bestätigen?" : loading ? "…" : <Trash2 size={14} />}
    </button>
  );
}
