"use client";

// components/admin/ProductForm.tsx

import { useActionState, useState } from "react";
import {
  Plus, Trash2, Save, AlertCircle,
  Loader2, Eye, EyeOff, Star,
} from "lucide-react";
import { createProduct, updateProduct } from "@/app/actions/products";
import type { ProductFormState } from "@/app/actions/products";
import type { Category } from "@/types";
import { ImageManager } from "@/components/admin/ImageManager";

interface SpecEntry { key: string; value: string }

interface Props {
  categories: Category[];
  product?: {
    id: string;
    name: string; slug: string; brand: string; sku?: string | null;
    description: string; price: number; comparePrice?: number | null;
    stock: number; lowStockAlert?: number; categoryId: string;
    isActive: boolean; isFeatured: boolean; tags: string[];
    specs: Record<string, string | number | boolean>; images: string[];
    weight?: number | null;
    // internal fields
    purchasePrice?: number | null; supplier?: string | null; supplierSku?: string | null;
  };
}

const INITIAL_STATE: ProductFormState = {};

// ─── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({ label, required, error, hint }: {
  label: string; required?: boolean; error?: string; hint?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-sm font-medium text-slate-300 flex items-center gap-1">
        {label}
        {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-xs text-slate-600 font-normal ml-1">({hint})</span>}
      </label>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

function Section({ title, children, subtitle }: {
  title: string; children: React.ReactNode; subtitle?: string;
}) {
  return (
    <div className="card p-5 sm:p-6 space-y-5">
      <div className="border-b border-slate-700/50 pb-3">
        <h2 className="font-semibold text-slate-200 text-sm uppercase tracking-wide">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Spec editor ─────────────────────────────────────────────────────────────

function SpecEditor({ specs, onChange }: {
  specs: SpecEntry[];
  onChange: (s: SpecEntry[]) => void;
}) {
  const add = () => onChange([...specs, { key: "", value: "" }]);
  const remove = (i: number) => onChange(specs.filter((_, j) => j !== i));
  const update = (i: number, field: "key" | "value", v: string) =>
    onChange(specs.map((s, j) => (j === i ? { ...s, [field]: v } : s)));

  // Grouped presets for common IT hardware categories
  const PRESETS = [
    { label: "Smartphone", keys: ["Chip", "Display", "Speicher", "RAM", "Kamera", "Akku", "Betriebssystem", "Farbe"] },
    { label: "Laptop/PC",  keys: ["Prozessor", "RAM", "Speicher", "Display", "Grafik", "Akku", "Betriebssystem"] },
    { label: "Tablet",     keys: ["Chip", "Display", "Speicher", "Kamera", "Akku", "Anschluss"] },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap mb-1">
        <span className="text-xs text-slate-500">Schnellausfüllen:</span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              const existing = specs.filter((s) => s.key.trim());
              const existingKeys = new Set(existing.map((s) => s.key));
              const newOnes = p.keys.filter((k) => !existingKeys.has(k)).map((key) => ({ key, value: "" }));
              onChange([...existing, ...newOnes]);
            }}
            className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-indigo-400 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {specs.map((spec, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              value={spec.key}
              onChange={(e) => update(idx, "key", e.target.value)}
              placeholder="Eigenschaft (z.B. Chip)"
              className="input text-sm flex-1"
            />
            <input
              value={spec.value}
              onChange={(e) => update(idx, "value", e.target.value)}
              placeholder="Wert (z.B. Apple M4)"
              className="input text-sm flex-1"
            />
            {specs.length > 1 && (
              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <Plus size={13} /> Eigenschaft hinzufügen
      </button>
    </div>
  );
}

// ─── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label, sub, icon: Icon }: {
  checked: boolean; onChange: (v: boolean) => void;
  label: string; sub?: string; icon?: React.ElementType;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-10 h-6 bg-slate-700 rounded-full peer-checked:bg-indigo-600 transition-colors" />
        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors flex items-center gap-1.5">
          {Icon && <Icon size={13} className={checked ? "text-indigo-400" : "text-slate-500"} />}
          {label}
        </p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </label>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function ProductForm({ categories, product }: Props) {
  const isEdit = !!product;
  const action = isEdit ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  // Core fields
  const [name,         setName]         = useState(product?.name ?? "");
  const [slug,         setSlug]         = useState(product?.slug ?? "");
  const [brand,        setBrand]        = useState(product?.brand ?? "");
  const [sku,          setSku]          = useState(product?.sku ?? "");
  const [description,  setDescription]  = useState(product?.description ?? "");
  const [price,        setPrice]        = useState(product?.price?.toString() ?? "");
  const [comparePrice, setComparePrice] = useState(product?.comparePrice?.toString() ?? "");
  const [stock,        setStock]        = useState(product?.stock?.toString() ?? "0");
  const [lowStockAlert,setLowStockAlert]= useState(product?.lowStockAlert?.toString() ?? "5");
  const [weight,       setWeight]       = useState(product?.weight?.toString() ?? "");
  const [categoryId,   setCategoryId]   = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [isActive,     setIsActive]     = useState(product?.isActive ?? true);
  const [isFeatured,   setIsFeatured]   = useState(product?.isFeatured ?? false);
  const [tags,         setTags]         = useState(product?.tags?.join(", ") ?? "");
  const [images,       setImages]       = useState<string[]>(product?.images ?? []);
  const [specs,        setSpecs]        = useState<SpecEntry[]>(
    product?.specs && Object.keys(product.specs).length > 0
      ? Object.entries(product.specs).map(([key, value]) => ({ key, value: String(value) }))
      : [{ key: "", value: "" }]
  );

  // Internal/purchasing fields
  const [purchasePrice, setPurchasePrice] = useState(product?.purchasePrice?.toString() ?? "");
  const [supplier,      setSupplier]      = useState(product?.supplier ?? "");
  const [supplierSku,   setSupplierSku]   = useState(product?.supplierSku ?? "");

  const autoSlug = (n: string) =>
    n.toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(autoSlug(v));
  };

  // Computed margin
  const margin = (() => {
    const p = parseFloat(price);
    const pp = parseFloat(purchasePrice);
    if (!p || !pp || pp <= 0) return null;
    return ((p - pp) / p * 100).toFixed(1);
  })();

  const specsJson = JSON.stringify(
    Object.fromEntries(specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value]))
  );

  const err = (field: string) => state.errors?.[field]?.[0];

  return (
    <div className="space-y-6">
      {state.message && !state.success && (
        <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-950/50 border border-red-900/50 text-red-400 text-sm animate-fade-in">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Hidden complex fields */}
        <input type="hidden" name="specs"      value={specsJson} />
        <input type="hidden" name="images"     value={images.join("\n")} />
        <input type="hidden" name="isActive"   value={String(isActive)} />
        <input type="hidden" name="isFeatured" value={String(isFeatured)} />

        {/* ── Produktinformationen ── */}
        <Section title="Produktinformationen">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FieldLabel label="Produktname" required error={err("name")} />
              <input
                name="name" value={name} onChange={(e) => handleNameChange(e.target.value)}
                className={`input ${err("name") ? "border-red-500" : ""}`}
                placeholder="z.B. Apple iPhone 16 Pro 256 GB"
                required
              />
            </div>

            <div>
              <FieldLabel label="Slug (URL)" required error={err("slug")} />
              <input
                name="slug" value={slug} onChange={(e) => setSlug(e.target.value)}
                className={`input font-mono text-sm ${err("slug") ? "border-red-500" : ""}`}
                placeholder="apple-iphone-16-pro-256gb"
                required
              />
              <p className="text-xs text-slate-600 mt-1">
                /products/<span className="text-indigo-400">{slug || "…"}</span>
              </p>
            </div>

            <div>
              <FieldLabel label="Marke" required error={err("brand")} />
              <input
                name="brand" value={brand} onChange={(e) => setBrand(e.target.value)}
                className={`input ${err("brand") ? "border-red-500" : ""}`}
                placeholder="Apple"
                required
              />
            </div>

            <div>
              <FieldLabel label="SKU (Artikelnummer)" error={err("sku")} />
              <input
                name="sku" value={sku} onChange={(e) => setSku(e.target.value)}
                className="input"
                placeholder="IP16P-256-BLK"
              />
            </div>

            <div>
              <FieldLabel label="Kategorie" required error={err("categoryId")} />
              <select
                name="categoryId" value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <FieldLabel label="Beschreibung" required error={err("description")} />
              <textarea
                name="description" value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5} className={`input resize-none ${err("description") ? "border-red-500" : ""}`}
                placeholder="Produktbeschreibung…"
                required
              />
            </div>
          </div>
        </Section>

        {/* ── Preis & Bestand ── */}
        <Section title="Preis & Bestand">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <FieldLabel label="Verkaufspreis (€)" required error={err("price")} />
              <input
                name="price" type="number" min="0" step="0.01"
                value={price} onChange={(e) => setPrice(e.target.value)}
                className={`input ${err("price") ? "border-red-500" : ""}`}
                placeholder="999.00" required
              />
            </div>
            <div>
              <FieldLabel label="Vergleichspreis (€)" hint="durchgestrichen" error={err("comparePrice")} />
              <input
                name="comparePrice" type="number" min="0" step="0.01"
                value={comparePrice} onChange={(e) => setComparePrice(e.target.value)}
                className="input"
                placeholder="1199.00"
              />
            </div>
            <div>
              <FieldLabel label="Lagerbestand (Stk.)" required error={err("stock")} />
              <input
                name="stock" type="number" min="0" step="1"
                value={stock} onChange={(e) => setStock(e.target.value)}
                className={`input ${err("stock") ? "border-red-500" : ""}`}
                required
              />
            </div>
            <div>
              <FieldLabel label="Warnung ab (Stk.)" />
              <input
                name="lowStockAlert" type="number" min="0"
                value={lowStockAlert} onChange={(e) => setLowStockAlert(e.target.value)}
                className="input"
                placeholder="5"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <FieldLabel label="Gewicht (g)" />
              <input
                name="weight" type="number" min="0"
                value={weight} onChange={(e) => setWeight(e.target.value)}
                className="input"
                placeholder="185"
              />
            </div>
            <div>
              <FieldLabel label="Tags (kommagetrennt)" />
              <input
                name="tags" value={tags} onChange={(e) => setTags(e.target.value)}
                className="input"
                placeholder="iphone, apple, smartphone"
              />
            </div>
          </div>
        </Section>

        {/* ── Produktbilder ── */}
        <Section
          title="Produktbilder"
          subtitle="1–8 Bilder · Erstes Bild = Hauptbild · Drag & Drop zum Sortieren"
        >
          <ImageManager
            images={images}
            onChange={setImages}
            productId={product?.id}
            categorySlug={categories.find((c) => c.id === categoryId)?.slug}
            disabled={isPending}
          />
          {images.length === 0 && (
            <p className="text-xs text-amber-400 flex items-center gap-1.5 mt-1">
              <AlertCircle size={12} /> Mindestens ein Bild empfohlen
            </p>
          )}
        </Section>

        {/* ── Technische Daten ── */}
        <Section title="Technische Daten (Specs)" subtitle="Werden auf der Produktdetailseite als Tabelle angezeigt.">
          <SpecEditor specs={specs} onChange={setSpecs} />
        </Section>

        {/* ── Interne Felder (admin-only) ── */}
        <Section title="Interne Felder" subtitle="Nur für Admins sichtbar – nie im Shop angezeigt.">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <FieldLabel label="Einkaufspreis (€ netto)" hint="intern" />
              <input
                name="purchasePrice" type="number" min="0" step="0.01"
                value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)}
                className="input"
                placeholder="650.00"
              />
              {margin !== null && (
                <p className="text-xs text-green-400 mt-1">Marge: {margin}%</p>
              )}
            </div>
            <div>
              <FieldLabel label="Lieferant" hint="intern" />
              <input
                name="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)}
                className="input"
                placeholder="Apple Distribution GmbH"
              />
            </div>
            <div>
              <FieldLabel label="Lieferanten-SKU" hint="intern" />
              <input
                name="supplierSku" value={supplierSku} onChange={(e) => setSupplierSku(e.target.value)}
                className="input font-mono text-sm"
                placeholder="APL-IP16P-256-BLK"
              />
            </div>
          </div>
        </Section>

        {/* ── Einstellungen ── */}
        <Section title="Einstellungen">
          <div className="space-y-4">
            <Toggle
              checked={isActive} onChange={setIsActive}
              label="Produkt aktiv"
              sub="Im Shop sichtbar und kaufbar"
              icon={isActive ? Eye : EyeOff}
            />
            <Toggle
              checked={isFeatured} onChange={setIsFeatured}
              label="Featured"
              sub="Auf der Startseite hervorgehoben"
              icon={Star}
            />
          </div>
        </Section>

        {/* ── Submit ── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary px-8 py-2.5 min-w-[160px]"
          >
            {isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Wird gespeichert…</>
            ) : (
              <><Save size={15} /> {isEdit ? "Änderungen speichern" : "Produkt erstellen"}</>
            )}
          </button>
          <a href="/admin/products" className="btn-secondary">Abbrechen</a>
        </div>
      </form>
    </div>
  );
}
