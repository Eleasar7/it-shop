// app/(shop)/products/[slug]/page.tsx

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeProduct, serializeProducts } from "@/lib/serializers";
import { ProductDetailClient } from "./ProductDetailClient";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!product) return null;
  return serializeProduct(product);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produkt nicht gefunden" };
  return {
    title: `${product.name} | Envetra`,
    description: product.description.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // Ähnliche Produkte
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    take: 4,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  const related = serializeProducts(relatedProducts);

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
