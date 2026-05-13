// app/api/orders/route.ts
// GET /api/orders – orders for the authenticated user

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where:   { userId: authUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true, productName: true, quantity: true,
            unitPrice: true, totalPrice: true, imageUrl: true,
          },
        },
      },
    });

    const serialized = orders.map((o) => ({
      ...o,
      totalAmount: Number(o.totalAmount),
      subtotal:    Number(o.subtotal),
      shippingCost: Number(o.shippingCost),
      taxAmount:   Number(o.taxAmount),
      items: o.items.map((i) => ({
        ...i,
        unitPrice:  Number(i.unitPrice),
        totalPrice: Number(i.totalPrice),
      })),
    }));

    return NextResponse.json({ data: serialized });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
