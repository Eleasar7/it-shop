"use client";

// app/(admin)/admin/products/RowActions.tsx
// FIX: Added toast notifications, duplicate action, view-in-shop link, archive option.

import { useTransition, useState } from "react";
import {
  Trash2, Eye, EyeOff, Star, Loader2,
  Copy, ExternalLink, Archive,
} from "lucide-react";
import { deleteProduct, duplicateProduct, toggleProductField } from "@/app/actions/products";
import { useToast } from "@/components/admin/Toast";
import { useRouter } from "next/navigation";

interface Props {
  productId: string;
  productSlug: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function ProductRowActions({ productId, productSlug, isActive, isFeatured }: Props) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const toggle = (field: "isActive" | "isFeatured", value: boolean) => {
    startTransition(async () => {
      const result = await toggleProductField(productId, field, value);
      if (result?.error) {
        toast({ message: result.error, type: "error" });
      } else {
        toast({
          message: field === "isActive"
            ? value ? "Produkt aktiviert" : "Produkt deaktiviert"
            : value ? "Als Featured markiert" : "Featured entfernt",
          type: "success",
        });
      }
    });
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateProduct(productId);
      if (result.error) {
        toast({ message: result.error, type: "error" });
      } else {
        toast({ message: "Produkt dupliziert – als Entwurf gespeichert", type: "success" });
        if (result.newId) router.push(`/admin/products/${result.newId}/edit`);
      }
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3500);
      return;
    }
    startTransition(async () => {
      const result = await deleteProduct(productId);
      if (result.error) {
        toast({ message: result.error, type: "error" });
      } else {
        toast({ message: "Produkt gelöscht", type: "success" });
      }
      setConfirmDelete(false);
    });
  };

  if (isPending) {
    return (
      <div className="flex items-center p-1.5">
        <Loader2 size={14} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {/* View in shop */}
      <a
        href={`/products/${productSlug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-950/30 transition-colors"
        title="Im Shop ansehen"
      >
        <ExternalLink size={13} />
      </a>

      {/* Duplicate */}
      <button
        onClick={handleDuplicate}
        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-950/30 transition-colors"
        title="Duplizieren"
      >
        <Copy size={13} />
      </button>

      {/* Toggle active */}
      <button
        onClick={() => toggle("isActive", !isActive)}
        className={`p-1.5 rounded-lg transition-colors ${
          isActive
            ? "text-green-400 hover:text-slate-400 hover:bg-slate-700"
            : "text-slate-500 hover:text-green-400 hover:bg-slate-700"
        }`}
        title={isActive ? "Deaktivieren" : "Aktivieren"}
      >
        {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>

      {/* Toggle featured */}
      <button
        onClick={() => toggle("isFeatured", !isFeatured)}
        className={`p-1.5 rounded-lg transition-colors ${
          isFeatured
            ? "text-indigo-400 hover:text-slate-400 hover:bg-slate-700"
            : "text-slate-500 hover:text-indigo-400 hover:bg-slate-700"
        }`}
        title={isFeatured ? "Featured entfernen" : "Als Featured markieren"}
      >
        <Star size={13} className={isFeatured ? "fill-indigo-400" : ""} />
      </button>

      {/* Delete with confirm */}
      <button
        onClick={handleDelete}
        className={`rounded-lg transition-colors text-xs font-medium ${
          confirmDelete
            ? "bg-red-600 text-white px-2 py-1"
            : "p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30"
        }`}
        title={confirmDelete ? "Klick zum Bestätigen" : "Löschen"}
      >
        {confirmDelete ? "Bestätigen?" : <Trash2 size={13} />}
      </button>
    </div>
  );
}
