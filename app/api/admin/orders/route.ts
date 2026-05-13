// app/api/admin/orders/route.ts
// Security: requireAdmin() outside try/catch so NEXT_REDIRECT propagates.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user:  { select: { email: true, name: true } },
        items: { select: { quantity: true, totalPrice: true } },
      },
    });

    const serialized = orders.map((o) => ({
      ...o,
      totalAmount:  Number(o.totalAmount),
      subtotal:     Number(o.subtotal),
      taxAmount:    Number(o.taxAmount),
      shippingCost: Number(o.shippingCost),
    }));

    return NextResponse.json({ data: serialized });
  } catch (error) {
    console.error("[GET /api/admin/orders]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
