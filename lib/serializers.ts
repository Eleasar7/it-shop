// lib/serializers.ts
// Converts Prisma Decimal and Date objects to plain JS primitives
// so they can be safely passed from Server Components to Client Components.

import type { Product, Category } from "@/types";

// ─── Product serializer ───────────────────────────────────────────────────────

/**
 * Converts a raw Prisma product row (with Decimal and Date fields) into
 * a plain object safe to pass as a React prop to Client Components.
 * 
 * - price / comparePrice / purchasePrice  → number (via Number())
 * - createdAt / updatedAt                 → ISO string
 * - category.createdAt                    → ISO string
 * - Internal fields (purchasePrice etc.)  are excluded from the result
 *   so they are never leaked to the browser.
 */
export function serializeProduct(p: {
  id: string;
  name: string;
  slug: string;
  brand: string;
  sku: string | null;
  description: string;
  specs: unknown;
  price: { toNumber?: () => number } | number | string;
  comparePrice: { toNumber?: () => number } | number | string | null;
  stock: number;
  reservedStock: number;
  lowStockAlert: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  weight: number | null;
  // Internal fields — excluded from output
  purchasePrice?: unknown;
  supplier?: unknown;
  supplierSku?: unknown;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
    createdAt?: Date | string;
  };
  createdAt: Date | string;
  updatedAt: Date | string;
}): Product {
  const toNum = (v: { toNumber?: () => number } | number | string | null | undefined): number | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === "number") return v;
    if (typeof v === "string") return parseFloat(v);
    if (typeof v.toNumber === "function") return v.toNumber();
    return Number(v);
  };

  return {
    id:           p.id,
    name:         p.name,
    slug:         p.slug,
    brand:        p.brand,
    sku:          p.sku,
    description:  p.description,
    specs:        p.specs as Record<string, string | number | boolean>,
    price:        toNum(p.price) ?? 0,
    comparePrice: toNum(p.comparePrice),
    stock:        p.stock,
    reservedStock:p.reservedStock,
    lowStockAlert:p.lowStockAlert,
    images:       p.images,
    isActive:     p.isActive,
    isFeatured:   p.isFeatured,
    tags:         p.tags,
    weight:       p.weight,
    // purchasePrice, supplier, supplierSku are intentionally EXCLUDED
    categoryId:   p.categoryId,
    category: {
      id:   p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      // strip Date fields from category — clients don't need them
    },
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  } as unknown as Product;
}

/**
 * Serializes an array of Prisma product rows.
 */
export function serializeProducts<T extends Parameters<typeof serializeProduct>[0]>(
  products: T[]
): Product[] {
  return products.map(serializeProduct);
}
