// app/api/admin/products/route.ts
// GET + POST /api/admin/products
// Security: requireAdmin() is called OUTSIDE try/catch so NEXT_REDIRECT propagates correctly.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

export async function GET() {
  // Must be outside try/catch — redirect() throws NEXT_REDIRECT internally
  await requireAdmin();

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true, slug: true } } },
    });

    const serialized = products.map((p) => ({
      ...p,
      price:        Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    }));

    return NextResponse.json({ data: serialized });
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const body   = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        price:        parsed.data.price,
        comparePrice: parsed.data.comparePrice ?? null,
      },
      include: { category: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({
      data: {
        ...product,
        price:        Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
