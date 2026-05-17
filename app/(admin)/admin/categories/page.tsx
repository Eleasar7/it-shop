"use client";

// app/(admin)/admin/categories/page.tsx

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Save, X, Check, Loader2, ImageOff, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  _count?: { products: number };
}

// ─── Image Upload Widget ──────────────────────────────────────────────────────

function CategoryImageUploader({
  category,
  onSaved,
}: {
  category: Category;
  onSaved: (imageUrl: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(category.imageUrl);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    setSaved(false);

    // Client-side preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`/api/admin/categories/${category.id}/upload-image`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setPreview(data.imageUrl);
      onSaved(data.imageUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [category.id]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  async function clearImage() {
    setUploading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: null }),
      });
      if (!res.ok) throw new Error("Failed to clear image");
      setPreview(null);
      onSaved("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-all overflow-hidden
          ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400 bg-gray-50"}
          ${uploading ? "pointer-events-none" : ""}
        `}
        style={{ height: 140 }}
      >
        {preview ? (
          <Image
            src={preview}
            alt={category.name}
            fill
            className="object-contain p-2"
            unoptimized={preview.startsWith("data:")}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-gray-400">
            <Upload size={22} />
            <span className="text-xs font-medium">Bild hochladen</span>
            <span className="text-[10px]">JPEG, PNG, WebP · max 5 MB</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-blue-600" />
          </div>
        )}

        {saved && (
          <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1">
            <Check size={12} />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex-1 text-xs font-semibold text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {preview ? "Bild ändern" : "Bild wählen"}
        </button>
        {preview && (
          <button
            type="button"
            onClick={clearImage}
            disabled={uploading}
            className="text-xs text-red-500 border border-red-200 rounded px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Inline Edit Row ──────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  onChange,
}: {
  cat: Category;
  onChange: (id: string, updates: Partial<Category>) => void;
}) {
  const [name, setName] = useState(cat.name);
  const [description, setDescription] = useState(cat.description ?? "");
  const [sortOrder, setSortOrder] = useState(cat.sortOrder);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, sortOrder }),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      onChange(cat.id, { name, description, sortOrder });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      {/* Image area */}
      <CategoryImageUploader
        category={cat}
        onSaved={(url) => onChange(cat.id, { imageUrl: url || null })}
      />

      {/* Fields */}
      <div className="mt-3 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-500"
          placeholder="Kategoriename"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-500 focus:outline-none focus:border-blue-500"
          placeholder="Beschreibung (optional)"
        />
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-gray-400 font-medium whitespace-nowrap">Reihenfolge</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-16 border border-gray-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-blue-500"
          />
          <span className="text-[10px] text-gray-400 flex-1">{cat._count?.products ?? 0} Produkte</span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={save}
        disabled={saving}
        className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#1a56db] hover:bg-[#1043b2] text-white text-xs font-bold rounded py-2 transition-colors disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={12} className="animate-spin" />
        ) : saved ? (
          <><Check size={12} /> Gespeichert</>
        ) : (
          <><Save size={12} /> Speichern</>
        )}
      </button>

      {error && (
        <p className="mt-1.5 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setError("Kategorien konnten nicht geladen werden"))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(id: string, updates: Partial<Category>) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900">Kategorien verwalten</h1>
        <p className="text-sm text-gray-500 mt-1">
          Produktbilder hochladen · Drag &amp; Drop · werden sofort auf der Homepage angezeigt
        </p>
      </div>

      {/* Info banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <ImageOff size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>Empfehlung:</strong> Verwende echte Produktfotos im Format <strong>JPEG oder WebP</strong>,
          mindestens <strong>600 × 400 px</strong>, weißer oder neutraler Hintergrund.
          Kein Emoji, keine KI-Illustrationen. Die Bilder werden in Supabase Storage (Bucket: <code className="bg-blue-100 px-1 rounded">category-images</code>) gespeichert.
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 text-gray-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryRow key={cat.id} cat={cat} onChange={handleChange} />
          ))}
        </div>
      )}
    </div>
  );
}
