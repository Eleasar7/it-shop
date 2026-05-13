// app/api/products/[id]/route.ts
// GET /api/products/:id – einzelnes Produkt (by id oder slug)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // Versuche erst by ID, dann by Slug
    // SECURITY: select only public fields — never expose purchasePrice/supplier/supplierSku
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isActive: true,
      },
      select: {
        id: true, name: true, slug: true, brand: true, sku: true,
        description: true, specs: true, price: true, comparePrice: true,
        stock: true, lowStockAlert: true, images: true,
        isActive: true, isFeatured: true, tags: true, weight: true,
        categoryId: true, createdAt: true, updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produkt nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      },
    });
  } catch (error) {
    console.error("[GET /api/products/[id]]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
