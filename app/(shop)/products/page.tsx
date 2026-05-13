// app/(shop)/products/page.tsx

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { serializeProducts } from "@/lib/serializers";
import { productFilterSchema } from "@/lib/validations";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { ProductSortSelect } from "@/components/shop/ProductSortSelect";
import { Package, GitCompare, Lightbulb, ChevronRight } from "lucide-react";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

interface PageProps { searchParams: Promise<Record<string, string>>; }

async function getData(params: Record<string, string>) {
  const parsed  = productFilterSchema.safeParse(params);
  const filters = parsed.success ? parsed.data : productFilterSchema.parse({});
  const where: Prisma.ProductWhereInput = { isActive: true };

  let categoryName: string | null = null;
  if (filters.category) {
    try {
      const cat = await prisma.category.findUnique({ where: { slug: filters.category }, select: { name: true } });
      if (cat) { categoryName = cat.name; where.category = { slug: filters.category }; }
    } catch {}
  }
  if (filters.brand)    where.brand = { equals: filters.brand, mode: "insensitive" };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
      ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
    };
  }
  if (filters.search) {
    where.OR = [
      { name:        { contains: filters.search, mode: "insensitive" } },
      { brand:       { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.inStock) where.stock = { gt: 0 };

  const orderByMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
    price_asc: { price: "asc" }, price_desc: { price: "desc" },
    name_asc: { name: "asc" }, newest: { createdAt: "desc" },
  };
  const orderBy = orderByMap[filters.sortBy] ?? { createdAt: "desc" };
  const skip = (filters.page - 1) * filters.pageSize;

  const [products, total, categories, brandRows] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: filters.pageSize,
      include: { category: { select: { id: true, name: true, slug: true } } } }).catch(() => []),
    prisma.product.count({ where }).catch(() => 0),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []),
    prisma.product.findMany({ where: { isActive: true }, select: { brand: true },
      distinct: ["brand"], orderBy: { brand: "asc" } }).catch(() => []),
  ]);

  return {
    products: serializeProducts(products),
    total, categories, brands: brandRows.map((b) => b.brand),
    filters, categoryName, totalPages: Math.ceil(total / filters.pageSize) || 1,
  };
}

export async function generateMetadata({ searchParams }: PageProps) {
  const p = await searchParams;
  const title = p.search ? `Suche: „${p.search}"` : p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : "Alle Produkte";
  return { title: `${title} | ZION IT` };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { products, total, categories, brands, filters, categoryName, totalPages } = await getData(params);
  const currentPage = filters.page;
  const pageTitle = filters.search ? `„${filters.search}"` : categoryName ?? "Alle Produkte";

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="section py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-medium flex-wrap">
          <Link href="/" className="hover:text-[#1a56db] transition-colors">Start</Link>
          <ChevronRight size={11} className="text-gray-400" />
          <Link href="/products" className="hover:text-[#1a56db] transition-colors">Produkte</Link>
          {categoryName && (
            <>
              <ChevronRight size={11} className="text-gray-400" />
              <span className="text-gray-700">{categoryName}</span>
            </>
          )}
          {filters.search && (
            <>
              <ChevronRight size={11} className="text-gray-400" />
              <span className="text-gray-700">Suche: {filters.search}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{total} {total === 1 ? "Produkt" : "Produkte"}</p>
          </div>
          <ProductSortSelect current={filters.sortBy} params={params} />
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="bg-white border border-[#e8eaed] rounded-lg p-4 sticky top-20">
              <Suspense fallback={<div className="skeleton h-64 rounded" />}>
                <ProductFilters categories={categories as any} brands={brands} currentFilters={filters} />
              </Suspense>
            </div>
          </aside>

          {/* Grid */}
          <main className="flex-1 min-w-0">
            {/* Compare hint */}
            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#eff4ff] border border-[#c7d9fb] rounded-lg text-xs text-gray-600">
              <GitCompare size={12} className="text-[#1a56db] flex-shrink-0" />
              <span>Klicke auf <strong>„Vergleichen"</strong> auf Produktkarten um bis zu 4 Produkte zu vergleichen.</span>
              <Link href="/compare" className="ml-auto text-[#1a56db] font-semibold whitespace-nowrap hover:underline">Zum Vergleich →</Link>
            </div>

            {products.length === 0 ? (
              <div className="bg-white border border-[#e8eaed] rounded-xl p-16 text-center">
                <Package size={40} className="mx-auto mb-4 text-gray-300" />
                <p className="font-bold text-gray-800 text-lg">Keine Produkte gefunden</p>
                <p className="text-sm text-gray-500 mt-2">
                  {filters.category ? "In dieser Kategorie gibt es keine Produkte." : "Passe deine Filter an."}
                </p>
                <div className="flex gap-3 justify-center mt-5">
                  <Link href="/products" className="btn-secondary text-sm">Filter zurücksetzen</Link>
                  <Link href="/beratung" className="btn-primary text-sm">
                    <Lightbulb size={13} /> Kaufberatung
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {products.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5 mt-8">
                    {currentPage > 1 && <PagLink params={params} page={currentPage - 1} label="← Zurück" />}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - currentPage) <= 2)
                      .map((p) => <PagLink key={p} params={params} page={p} label={String(p)} isActive={p === currentPage} />)}
                    {currentPage < totalPages && <PagLink params={params} page={currentPage + 1} label="Weiter →" />}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function PagLink({ params, page, label, isActive }: {
  params: Record<string, string>; page: number; label: string; isActive?: boolean;
}) {
  const sp = new URLSearchParams({ ...params, page: String(page) });
  return (
    <Link href={`/products?${sp}`}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-[#1a56db] text-white"
          : "bg-white border border-[#dadce0] text-gray-700 hover:border-[#1a56db] hover:text-[#1a56db]"
      }`}>
      {label}
    </Link>
  );
}
