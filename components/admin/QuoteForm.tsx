"use client";

// components/admin/QuoteForm.tsx

import { useActionState, useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2, CheckCircle2, AlertCircle, Search } from "lucide-react";
import type { QuoteFormState } from "@/app/actions/quotes";
import type { Product } from "@/types";

interface QuoteItemRow {
  productId?: string;
  productName: string;
  productSku?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  note?: string;
}

interface Props {
  action: (prev: QuoteFormState, fd: FormData) => Promise<QuoteFormState>;
  products: Pick<Product, "id" | "name" | "sku" | "price" | "images" | "brand">[];
  initialData?: {
    customerEmail?: string;
    customerName?: string;
    customerCompany?: string;
    customerVatId?: string;
    customerPhone?: string;
    userId?: string;
    b2bRequestId?: string;
    taxRate?: number;
    notes?: string;
    adminNotes?: string;
    validUntil?: string;
    items?: QuoteItemRow[];
  };
  submitLabel?: string;
}

const TAX_RATE = 0.19;

export function QuoteForm({ action, products, initialData, submitLabel = "Angebot erstellen" }: Props) {
  const [state, formAction, isPending] = useActionState(action, {});

  const [customerEmail,   setCustomerEmail]   = useState(initialData?.customerEmail   ?? "");
  const [customerName,    setCustomerName]    = useState(initialData?.customerName    ?? "");
  const [customerCompany, setCustomerCompany] = useState(initialData?.customerCompany ?? "");
  const [customerVatId,   setCustomerVatId]   = useState(initialData?.customerVatId   ?? "");
  const [customerPhone,   setCustomerPhone]   = useState(initialData?.customerPhone   ?? "");
  const [notes,           setNotes]           = useState(initialData?.notes           ?? "");
  const [adminNotes,      setAdminNotes]      = useState(initialData?.adminNotes      ?? "");
  const [validUntil,      setValidUntil]      = useState(initialData?.validUntil      ?? "");
  const [items, setItems] = useState<QuoteItemRow[]>(
    initialData?.items?.length ? initialData.items : [{ productName: "", unitPrice: 0, quantity: 1 }]
  );
  const [productSearch, setProductSearch] = useState("");

  const subtotal    = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const taxAmount   = subtotal * TAX_RATE;
  const totalAmount = subtotal + taxAmount;

  const fmt = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const addItem = () => setItems((p) => [...p, { productName: "", unitPrice: 0, quantity: 1 }]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));
  const updateItem = (idx: number, patch: Partial<QuoteItemRow>) =>
    setItems((p) => p.map((item, i) => i === idx ? { ...item, ...patch } : item));

  const addProductToItems = (product: typeof products[0]) => {
    setItems((p) => [
      ...p.filter((i) => i.productName), // remove empty rows
      {
        productId:   product.id,
        productName: product.name,
        productSku:  product.sku ?? undefined,
        imageUrl:    product.images[0] ?? undefined,
        unitPrice:   product.price,
        quantity:    1,
      },
    ]);
    setProductSearch("");
  };

  const filteredProducts = productSearch.length >= 2
    ? products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku ?? "").toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <form action={(fd) => {
      fd.set("items", JSON.stringify(items));
      fd.set("taxRate", String(TAX_RATE));
      fd.set("customerEmail", customerEmail);
      fd.set("customerName", customerName);
      fd.set("customerCompany", customerCompany);
      fd.set("customerVatId", customerVatId);
      fd.set("customerPhone", customerPhone);
      fd.set("notes", notes);
      fd.set("adminNotes", adminNotes);
      fd.set("validUntil", validUntil);
      formAction(fd);
    }} className="space-y-6">

      {state.success && (
        <div className="flex items-center gap-2 text-green-400 text-sm p-3 rounded-xl bg-green-950/30 border border-green-500/20">
          <CheckCircle2 size={15} /> Angebot gespeichert
        </div>
      )}
      {state.error && (
        <div className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-xl bg-red-950/30 border border-red-500/20">
          <AlertCircle size={15} /> {state.error}
        </div>
      )}

      {/* Customer info */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-200 text-sm uppercase tracking-wide border-b border-slate-700/50 pb-3">
          Kundendaten
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "E-Mail *", value: customerEmail, set: setCustomerEmail, type: "email", placeholder: "kunde@firma.de" },
            { label: "Name",     value: customerName,  set: setCustomerName,  placeholder: "Max Mustermann" },
            { label: "Firma",    value: customerCompany,set: setCustomerCompany, placeholder: "Musterfirma GmbH" },
            { label: "USt.-ID",  value: customerVatId,  set: setCustomerVatId,  placeholder: "DE123456789" },
            { label: "Telefon",  value: customerPhone,  set: setCustomerPhone,  placeholder: "+49 711 …" },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
              <input
                type={type ?? "text"}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="input text-sm"
                required={label.includes("*")}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Gültig bis</label>
            <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
              className="input text-sm" min={new Date().toISOString().slice(0, 10)} />
          </div>
        </div>
      </div>

      {/* Product search + items */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-200 text-sm uppercase tracking-wide border-b border-slate-700/50 pb-3">
          Positionen
        </h2>

        {/* Product search */}
        <div className="relative">
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-700/50 bg-slate-800/30">
            <Search size={14} className="text-slate-500 flex-shrink-0" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Produkt aus Katalog suchen und hinzufügen…"
              className="bg-transparent flex-1 text-sm text-slate-200 placeholder-slate-600 outline-none"
            />
          </div>
          {filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-xl overflow-hidden"
              style={{ background: "rgb(var(--bg-elevated))", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
              {filteredProducts.map((p) => (
                <button key={p.id} type="button" onClick={() => addProductToItems(p)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.brand}{p.sku ? ` · ${p.sku}` : ""} · {
                      new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(p.price)
                    }</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Line items */}
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider px-1">
            <div className="col-span-5">Produkt</div>
            <div className="col-span-2">SKU</div>
            <div className="col-span-2 text-right">Einzelpreis</div>
            <div className="col-span-1 text-center">Menge</div>
            <div className="col-span-2 text-right">Gesamt</div>
          </div>

          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-slate-800/30 border border-slate-700/30">
              <div className="col-span-5">
                <input
                  value={item.productName}
                  onChange={(e) => updateItem(idx, { productName: e.target.value })}
                  placeholder="Produktbezeichnung"
                  className="input text-sm py-1.5"
                  required
                />
              </div>
              <div className="col-span-2">
                <input
                  value={item.productSku ?? ""}
                  onChange={(e) => updateItem(idx, { productSku: e.target.value })}
                  placeholder="SKU"
                  className="input text-sm py-1.5 font-mono"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number" min="0" step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                  className="input text-sm py-1.5 text-right tabular-nums"
                />
              </div>
              <div className="col-span-1">
                <input
                  type="number" min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value) || 1 })}
                  className="input text-sm py-1.5 text-center tabular-nums"
                />
              </div>
              <div className="col-span-1 text-right text-sm font-semibold text-slate-200 tabular-nums">
                {fmt(item.unitPrice * item.quantity)}
              </div>
              <div className="col-span-1 flex justify-end">
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)}
                    className="p-1 text-slate-600 hover:text-red-400 transition-colors rounded-lg">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addItem}
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          <Plus size={13} /> Weitere Position
        </button>

        {/* Totals */}
        <div className="pt-4 border-t border-slate-700/50 space-y-1.5 text-sm">
          {[
            { label: "Nettobetrag",   value: subtotal },
            { label: "MwSt. (19%)",   value: taxAmount },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-slate-400">
              <span>{label}</span>
              <span className="tabular-nums">{fmt(value)}</span>
            </div>
          ))}
          <div className="flex justify-between font-black text-base pt-1.5 border-t border-slate-700/50">
            <span className="text-slate-100">Gesamtbetrag (brutto)</span>
            <span className="text-slate-50 tabular-nums">{fmt(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-slate-200 text-sm uppercase tracking-wide border-b border-slate-700/50 pb-3">
          Notizen
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Kundennotiz <span className="text-slate-600 font-normal">(sichtbar auf Angebot)</span>
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              rows={4} className="input text-sm resize-none"
              placeholder="Zahlungsbedingungen, Lieferhinweise…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Interne Notiz <span className="text-slate-600 font-normal">(nur Admins)</span>
            </label>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
              rows={4} className="input text-sm resize-none"
              placeholder="Verhandlungsstand, Rabattgrund…" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending
            ? <><Loader2 size={14} className="animate-spin" /> Speichert…</>
            : <><Save size={14} /> {submitLabel}</>}
        </button>
        <a href="/admin/quotes" className="btn-secondary">Abbrechen</a>
      </div>
    </form>
  );
}
