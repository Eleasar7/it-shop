// app/(admin)/admin/products/[id]/edit/page.tsx

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, select: { name: true } });
  return { title: product ? `${product.name} bearbeiten | Admin` : "Produkt bearbeiten | Admin" };
}

export default async function EditProductPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  const serialized = {
    ...product,
    price:         Number(product.price),
    comparePrice:  product.comparePrice  ? Number(product.comparePrice)  : null,
    purchasePrice: (product as any).purchasePrice ? Number((product as any).purchasePrice) : null,
    supplier:      (product as any).supplier    ?? null,
    supplierSku:   (product as any).supplierSku ?? null,
    specs: (product.specs ?? {}) as Record<string, string | number | boolean>,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4">
          <ChevronLeft size={15} /> Zurück zu Produkten
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Produkt bearbeiten</h1>
            <p className="text-slate-500 text-sm mt-1">{product.name}</p>
          </div>
          <Link href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer"
            className="btn-secondary text-sm flex-shrink-0">
            <ExternalLink size={13} /> Im Shop
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs">
        <span className={`badge ${product.isActive ? "badge-success" : "badge-neutral"}`}>
          {product.isActive ? "Aktiv" : "Inaktiv"}
        </span>
        {product.isFeatured && <span className="badge badge-info">Featured</span>}
        <span className={`badge ${product.stock === 0 ? "badge-danger" : product.stock <= 5 ? "badge-warning" : "badge-neutral"}`}>
          Bestand: {product.stock} Stk.
        </span>
        {product.sku && <span className="badge badge-neutral">SKU: {product.sku}</span>}
        {(product as any).supplier && (
          <span className="badge badge-neutral">Lieferant: {(product as any).supplier}</span>
        )}
      </div>

      <ProductForm categories={categories as any} product={serialized} />
    </div>
  );
}
