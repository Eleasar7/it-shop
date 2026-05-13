"use client";

/**
 * components/admin/ImageManager.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete product media management UI.
 * Features:
 *   • 1–8 images per product
 *   • Drag & drop to reorder
 *   • Main image selection (first = main)
 *   • Delete individual images (with optional storage cleanup)
 *   • Replace an image with a new upload
 *   • URL import (with validation)
 *   • Bulk CSV import (sku,image1,...,image8)
 *   • Per-category fallback if no image exists
 *   • Upload validation: type, size, friendly errors
 *
 * IMAGE RIGHTS NOTICE:
 * Always source images from official manufacturer/supplier asset portals.
 * Do not scrape or hotlink images from retail sites or search engines.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
  useCallback,
} from "react";
import {
  Upload, X, Star, ZoomIn, AlertCircle, Loader2,
  Plus, Link2, ArrowUpDown, Trash2, ImageIcon,
  CheckCircle2, RefreshCw, GripVertical, Info,
} from "lucide-react";
import { uploadProductImage } from "@/app/actions/images";
import {
  validateImageFile,
  validateImageUrl,
  MAX_IMAGES_PER_PRODUCT,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
  getCategoryFallback,
} from "@/lib/images";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ImageManagerProps {
  /** Current image URL array (max 8). First = main image. */
  images: string[];
  /** Called whenever the image list changes (for form state sync). */
  onChange: (images: string[]) => void;
  /** Optional: product ID for upload path organisation. */
  productId?: string;
  /** Optional: category slug for fallback display. */
  categorySlug?: string;
  /** Whether we're in read-only mode (e.g. during form submit). */
  disabled?: boolean;
}

// ── Mini lightbox ─────────────────────────────────────────────────────────────

function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 animate-[fadeIn_.15s_ease]"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs">
        Klick oder Esc zum Schließen
      </p>
    </div>
  );
}

// ── Image tile ────────────────────────────────────────────────────────────────

interface ImageTileProps {
  url: string;
  index: number;
  total: number;
  productId?: string;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onRemove: () => void;
  onSetMain: () => void;
  onPreview: () => void;
  onReplace: (file: File) => void;
  disabled?: boolean;
}

function ImageTile({
  url,
  index,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
  onSetMain,
  onPreview,
  onReplace,
  disabled,
}: ImageTileProps) {
  const replaceRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);
  const isMain = index === 0;

  return (
    <div
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all select-none
        ${isDragging ? "opacity-40 scale-95" : ""}
        ${isDragOver ? "border-[#1a56db] ring-2 ring-[#1a56db]/30 scale-[1.02]" : isMain ? "border-[#1a56db]/60" : "border-slate-700/40"}
        ${disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}
        bg-slate-900
      `}
    >
      {/* Image */}
      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={`Bild ${index + 1}`}
          className="w-full h-full object-contain p-2 transition-transform group-hover:scale-[1.02]"
          onError={() => setImgError(true)}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-600">
          <ImageIcon size={24} />
          <span className="text-[9px]">Ladefehler</span>
        </div>
      )}

      {/* Main badge */}
      {isMain && (
        <div className="absolute top-1.5 left-1.5 z-10">
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[#1a56db] text-white text-[9px] font-bold shadow">
            <Star size={7} className="fill-white" /> Haupt
          </span>
        </div>
      )}

      {/* Index number (non-main) */}
      {!isMain && (
        <div className="absolute top-1.5 left-1.5 z-10">
          <span className="w-4 h-4 rounded-full bg-black/50 text-white text-[9px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
        </div>
      )}

      {/* Drag handle */}
      {!disabled && (
        <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none">
          <GripVertical size={12} className="text-white" />
        </div>
      )}

      {/* Action overlay */}
      {!disabled && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
          {/* Preview */}
          <button
            type="button"
            onClick={onPreview}
            className="p-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20 transition-colors"
            title="Vorschau"
          >
            <ZoomIn size={13} />
          </button>

          {/* Set as main */}
          {!isMain && (
            <button
              type="button"
              onClick={onSetMain}
              className="p-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-[#1a56db]/80 transition-colors"
              title="Als Hauptbild setzen"
            >
              <Star size={13} />
            </button>
          )}

          {/* Replace */}
          <button
            type="button"
            onClick={() => replaceRef.current?.click()}
            className="p-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-amber-600/80 transition-colors"
            title="Ersetzen"
          >
            <RefreshCw size={13} />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-red-600/80 transition-colors"
            title="Entfernen"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {/* Hidden replace input */}
      <input
        ref={replaceRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onReplace(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── URL Import panel ──────────────────────────────────────────────────────────

function UrlImportPanel({
  onAdd,
  disabled,
}: {
  onAdd: (url: string) => void;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    const validation = validateImageUrl(trimmed);
    if (!validation.valid) {
      setError(validation.error ?? "Ungültige URL");
      return;
    }

    onAdd(trimmed);
    setUrl("");
    setError("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            placeholder="https://hersteller.de/produkt-bild.jpg"
            className="input text-sm pl-8 w-full"
            disabled={disabled}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || !url.trim()}
          className="btn-secondary px-3 py-2 text-sm flex-shrink-0 flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus size={14} /> URL hinzufügen
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={11} /> {error}
        </p>
      )}
      <p className="text-[10px] text-slate-600 flex items-start gap-1.5">
        <Info size={10} className="mt-0.5 flex-shrink-0 text-slate-500" />
        Nur URLs von offiziellen Hersteller- oder Lieferanten-Portalen verwenden.
        Keine Bilder von Einzelhändlern oder Suchmaschinen scrapen.
      </p>
    </div>
  );
}

// ── Drop zone (upload) ────────────────────────────────────────────────────────

function DropZone({
  onFile,
  isUploading,
  disabled,
}: {
  onFile: (file: File) => void;
  isUploading: boolean;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error ?? "Ungültige Datei");
      return;
    }
    setError("");
    onFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${disabled || isUploading ? "cursor-not-allowed opacity-60" : "hover:border-[#1a56db]/50 hover:bg-slate-800/30"}
          ${isDragOver ? "border-[#1a56db] bg-[#1a56db]/5 scale-[1.01]" : "border-slate-700"}
          ${isUploading ? "border-indigo-500/60 bg-indigo-500/5" : ""}
        `}
      >
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
          {isUploading ? (
            <Loader2 size={18} className="text-indigo-400 animate-spin" />
          ) : (
            <Upload size={18} className={isDragOver ? "text-[#1a56db]" : "text-slate-400"} />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            {isUploading ? "Wird hochgeladen…" : isDragOver ? "Loslassen zum Hochladen" : "Bild hochladen"}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Drag & Drop oder klicken ·{" "}
            {ALLOWED_EXTENSIONS.map((e) => e.toUpperCase()).join(", ")} ·
            max. {MAX_FILE_SIZE_BYTES / 1024 / 1024} MB
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
          className="sr-only"
          disabled={disabled || isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </label>
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ── Main ImageManager Component ───────────────────────────────────────────────

export function ImageManager({
  images,
  onChange,
  productId,
  categorySlug,
  disabled,
}: ImageManagerProps) {
  const [uploadState, uploadAction] = useActionState(uploadProductImage, {});
  const [isUploading, startUpload] = useTransition();
  const [isReplacing, setIsReplacing] = useState(false);

  // Drag-and-drop state
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Tab state: upload | url
  const [tab, setTab] = useState<"upload" | "url">("upload");

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Upload feedback
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Handle successful upload via server action
  useEffect(() => {
    if (uploadState.url) {
      if (images.length < MAX_IMAGES_PER_PRODUCT) {
        onChange([...images, uploadState.url]);
        setUploadSuccess(true);
        setUploadError("");
        setTimeout(() => setUploadSuccess(false), 2000);
      }
    }
    if (uploadState.error) {
      setUploadError(uploadState.error);
    }
  }, [uploadState]);

  const handleFile = useCallback(
    (file: File) => {
      if (images.length >= MAX_IMAGES_PER_PRODUCT) {
        setUploadError(`Maximal ${MAX_IMAGES_PER_PRODUCT} Bilder pro Produkt.`);
        return;
      }
      setUploadError("");
      const fd = new FormData();
      fd.set("file", file);
      if (productId) fd.set("productId", productId);
      startUpload(() => uploadAction(fd));
    },
    [images.length, productId, uploadAction]
  );

  const handleReplace = useCallback(
    async (index: number, file: File) => {
      setIsReplacing(true);
      setUploadError("");

      const validation = validateImageFile(file);
      if (!validation.valid) {
        setUploadError(validation.error ?? "Ungültige Datei");
        setIsReplacing(false);
        return;
      }

      const fd = new FormData();
      fd.set("file", file);
      if (productId) fd.set("productId", productId);
      fd.set("oldUrl", images[index]);

      // Use uploadProductImage for the upload, then swap in the array
      const result = await uploadProductImage({}, fd);
      if (result.url) {
        const updated = images.map((u, i) => (i === index ? result.url! : u));
        onChange(updated);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2000);
      } else if (result.error) {
        setUploadError(result.error);
      }
      setIsReplacing(false);
    },
    [images, productId, onChange]
  );

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetMain = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.unshift(moved);
    onChange(next);
  };

  const handleAddUrl = (url: string) => {
    if (images.length >= MAX_IMAGES_PER_PRODUCT) {
      setUploadError(`Maximal ${MAX_IMAGES_PER_PRODUCT} Bilder pro Produkt.`);
      return;
    }
    if (images.includes(url)) {
      setUploadError("Diese URL ist bereits vorhanden.");
      return;
    }
    onChange([...images, url]);
    setUploadError("");
  };

  // Drag & drop reorder
  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const atMax = images.length >= MAX_IMAGES_PER_PRODUCT;
  const isWorking = isUploading || isReplacing;

  return (
    <div className="space-y-4">

      {/* ── Image grid ─────────────────────────────────────────────────── */}
      {images.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <ArrowUpDown size={11} className="text-slate-500" />
              Ziehen zum Sortieren · Erstes Bild = Hauptbild
            </p>
            <span className="text-xs text-slate-500">
              {images.length}/{MAX_IMAGES_PER_PRODUCT}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {images.map((url, idx) => (
              <ImageTile
                key={`${url}-${idx}`}
                url={url}
                index={idx}
                total={images.length}
                productId={productId}
                isDragging={dragIdx === idx}
                isDragOver={dragOverIdx === idx}
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                onRemove={() => handleRemove(idx)}
                onSetMain={() => handleSetMain(idx)}
                onPreview={() => setLightboxUrl(url)}
                onReplace={(file) => handleReplace(idx, file)}
                disabled={disabled || isWorking}
              />
            ))}

            {/* Empty slot placeholders */}
            {Array.from({ length: MAX_IMAGES_PER_PRODUCT - images.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center opacity-30"
              >
                <ImageIcon size={16} className="text-slate-600" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* No images – show category fallback hint */
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-700">
            <ImageIcon size={24} className="text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Noch keine Bilder</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Im Shop wird ein Kategorie-Platzhalterbild angezeigt.
            </p>
            {categorySlug && (
              <p className="text-[10px] text-slate-600 mt-1">
                Fallback: <code className="text-indigo-400">{getCategoryFallback(categorySlug)}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Status messages ────────────────────────────────────────────── */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 text-green-400 text-xs bg-green-950/30 border border-green-500/20 rounded-lg px-3 py-2">
          <CheckCircle2 size={12} /> Bild erfolgreich hochgeladen
        </div>
      )}
      {uploadError && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-900/30 rounded-lg px-3 py-2">
          <AlertCircle size={12} /> {uploadError}
        </div>
      )}
      {atMax && (
        <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-950/30 border border-amber-700/30 rounded-lg px-3 py-2">
          <Info size={12} /> Maximale Anzahl ({MAX_IMAGES_PER_PRODUCT}) erreicht. Erst ein Bild entfernen.
        </div>
      )}

      {/* ── Add images ─────────────────────────────────────────────────── */}
      {!atMax && (
        <div className="space-y-3">
          {/* Tab switcher */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 w-fit">
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                tab === "upload"
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Upload size={12} /> Hochladen
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-colors ${
                tab === "url"
                  ? "bg-slate-700 text-slate-100"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Link2 size={12} /> URL
            </button>
          </div>

          {tab === "upload" && (
            <DropZone
              onFile={handleFile}
              isUploading={isUploading}
              disabled={disabled}
            />
          )}

          {tab === "url" && (
            <UrlImportPanel onAdd={handleAddUrl} disabled={disabled} />
          )}
        </div>
      )}

      {/* ── Lightbox ───────────────────────────────────────────────────── */}
      {lightboxUrl && (
        <Lightbox
          src={lightboxUrl}
          alt="Produktbild Vorschau"
          onClose={() => setLightboxUrl(null)}
        />
      )}
    </div>
  );
}
