"use client";

/**
 * app/(admin)/admin/products/media/BulkImageImportClient.tsx
 *
 * Client component for the bulk CSV image import UI.
 *
 * CSV format expected:
 *   sku,image1,image2,image3,image4,image5,image6,image7,image8
 *
 * IMAGE RIGHTS NOTICE:
 * URLs in the CSV must originate from official manufacturer or authorised
 * distributor image feeds. Never import URLs scraped from retail sites.
 */

import { useActionState, useRef, useState } from "react";
import {
  Upload, FileText, AlertCircle, CheckCircle2,
  Loader2, Info, Download, X,
} from "lucide-react";
import { bulkImportImages, type BulkImageImportResult } from "@/app/actions/images";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/images";

const INITIAL: BulkImageImportResult = {
  processed: 0,
  updated: 0,
  notFound: [],
  errors: [],
};

const CSV_TEMPLATE = [
  ["sku", ...Array.from({ length: MAX_IMAGES_PER_PRODUCT }, (_, i) => `image${i + 1}`)].join(","),
  ["PROD-001", "https://example.com/bild1.jpg", "https://example.com/bild2.jpg", "", "", "", "", "", ""].join(","),
  ["PROD-002", "https://example.com/bild.jpg", "", "", "", "", "", "", ""].join(","),
].join("\n");

export function BulkImageImportClient() {
  const [state, formAction, isPending] = useActionState(bulkImportImages, null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
      return;
    }
    setFileName(file.name);
    if (fileRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileRef.current.files = dt.files;
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "produktbilder-import-vorlage.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasResult = state !== null && state.processed > 0;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Info box ── */}
      <div className="card p-4 space-y-3">
        <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
          <Info size={14} className="text-indigo-400" />
          Bildrechte & Importhinweis
        </h2>
        <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <p>
            <strong className="text-slate-300">Verwende ausschließlich</strong> Bilder aus:
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
            <li>Offiziellen Hersteller-Pressportalen (Apple, Dell, HP, Lenovo, …)</li>
            <li>Deinen autorisierten Distributor- oder Lieferanten-Bild-Feeds</li>
            <li>Deinen eigenen Studio-/Produktfotos im Supabase-Bucket</li>
          </ul>
          <p className="text-amber-400/80">
            ⚠ Keine Bilder von Einzelhändler-Websites, Google-Bilder oder anderen
            Quellen ohne explizite kommerzielle Lizenz importieren.
          </p>
        </div>
      </div>

      {/* ── CSV format info + template download ── */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-200 text-sm">CSV-Format</h2>
          <button
            type="button"
            onClick={downloadTemplate}
            className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"
          >
            <Download size={12} /> Vorlage herunterladen
          </button>
        </div>

        <div className="bg-slate-900 rounded-lg p-3 font-mono text-[11px] text-slate-400 overflow-x-auto">
          <p className="text-slate-300">sku,image1,image2,image3,...,image8</p>
          <p className="mt-1">PROD-001,https://hersteller.de/bild1.jpg,https://hersteller.de/bild2.jpg</p>
          <p>PROD-002,https://distributor.com/produkt.jpg</p>
        </div>

        <ul className="text-xs text-slate-500 space-y-1">
          <li>• Spalte <code className="text-indigo-400">sku</code> muss mit der Artikel-SKU im Shop übereinstimmen</li>
          <li>• Bis zu <code className="text-indigo-400">{MAX_IMAGES_PER_PRODUCT}</code> Bild-Spalten (image1–image{MAX_IMAGES_PER_PRODUCT})</li>
          <li>• Leere Bild-Spalten werden ignoriert</li>
          <li>• Neue Bilder werden <em>vor</em> bestehenden Bildern eingefügt</li>
          <li>• Kodierung: UTF-8, Trennzeichen: Komma</li>
        </ul>
      </div>

      {/* ── Upload form ── */}
      <form action={formAction} className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-200 text-sm">CSV hochladen</h2>

        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all
            ${dragOver ? "border-[#1a56db] bg-[#1a56db]/5" : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"}
          `}
        >
          {fileName ? (
            <>
              <FileText size={28} className="text-indigo-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">{fileName}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klicken um eine andere Datei zu wählen
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload size={28} className="text-slate-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  CSV-Datei hochladen
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Drag & Drop oder klicken · .csv · max. 5 MB
                </p>
              </div>
            </>
          )}

          <input
            ref={fileRef}
            type="file"
            name="csv"
            accept=".csv,.txt"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFileName(file.name);
            }}
          />
        </label>

        {fileName && (
          <button
            type="button"
            onClick={() => { setFileName(null); if (fileRef.current) fileRef.current.value = ""; }}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <X size={11} /> Datei entfernen
          </button>
        )}

        <button
          type="submit"
          disabled={isPending || !fileName}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 disabled:opacity-50"
        >
          {isPending ? (
            <><Loader2 size={15} className="animate-spin" /> Wird importiert…</>
          ) : (
            <><Upload size={15} /> Import starten</>
          )}
        </button>
      </form>

      {/* ── Results ── */}
      {hasResult && state && (
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-400" />
            Import-Ergebnis
          </h2>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-slate-100">{state.processed}</p>
              <p className="text-xs text-slate-500 mt-0.5">Verarbeitet</p>
            </div>
            <div className="bg-green-950/40 rounded-lg p-3 text-center border border-green-500/20">
              <p className="text-xl font-bold text-green-400">{state.updated}</p>
              <p className="text-xs text-slate-500 mt-0.5">Aktualisiert</p>
            </div>
            <div className="bg-amber-950/40 rounded-lg p-3 text-center border border-amber-500/20">
              <p className="text-xl font-bold text-amber-400">{state.notFound.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Nicht gefunden</p>
            </div>
          </div>

          {state.notFound.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-amber-400">SKUs nicht gefunden:</p>
              <div className="bg-amber-950/20 rounded-lg p-3">
                {state.notFound.map((sku) => (
                  <p key={sku} className="text-xs font-mono text-amber-300">{sku}</p>
                ))}
              </div>
            </div>
          )}

          {state.errors.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-red-400 flex items-center gap-1.5">
                <AlertCircle size={11} /> Fehler:
              </p>
              <div className="bg-red-950/20 rounded-lg p-3 space-y-1">
                {state.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-300">
                    {err.sku ? <><span className="font-mono">{err.sku}</span>: </> : ""}
                    {err.error}
                  </p>
                ))}
              </div>
            </div>
          )}

          {state.updated > 0 && state.errors.length === 0 && (
            <p className="text-xs text-green-400 flex items-center gap-1.5">
              <CheckCircle2 size={11} />
              Import erfolgreich abgeschlossen.
            </p>
          )}
        </div>
      )}

      {/* Error: no result yet but errors */}
      {state?.errors && state.errors.length > 0 && !hasResult && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 border border-red-900/30 rounded-xl px-4 py-3">
          <AlertCircle size={16} /> {state.errors[0]?.error}
        </div>
      )}
    </div>
  );
}
