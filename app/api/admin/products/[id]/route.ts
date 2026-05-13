// app/api/admin/products/[id]/route.ts
// Security: requireAdmin() is called OUTSIDE try/catch so NEXT_REDIRECT propagates correctly.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validations";

interface Params { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  await requireAdmin();

  try {
    const { id } = await params;
    const body   = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id },
      data:  { ...parsed.data, comparePrice: parsed.data.comparePrice ?? null },
    });

    return NextResponse.json({
      data: { ...product, price: Number(product.price) },
    });
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  await requireAdmin();

  try {
    const { id } = await params;

    // Preserve order history — deactivate instead of delete if referenced
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      await prisma.product.update({ where: { id }, data: { isActive: false } });
      return NextResponse.json({ message: "Produkt deaktiviert (hat Bestellungen)" });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Produkt gelöscht" });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
