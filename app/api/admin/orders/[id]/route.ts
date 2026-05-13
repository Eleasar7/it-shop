// app/api/admin/orders/[id]/route.ts
// Security: requireAdmin() outside try/catch so NEXT_REDIRECT propagates.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum([
    "PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED",
  ]).optional(),
  paymentStatus: z.enum([
    "PENDING","PAID","FAILED","REFUNDED","PARTIALLY_REFUNDED",
  ]).optional(),
  adminNotes: z.string().optional(),
});

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  await requireAdmin();

  try {
    const { id }   = await params;
    const body     = await request.json();
    const parsed   = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data:  parsed.data,
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error("[PATCH /api/admin/orders/[id]]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

export async function GET(_request: Request, { params }: Params) {
  await requireAdmin();

  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user:  { select: { email: true, name: true } },
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({
      data: { ...order, totalAmount: Number(order.totalAmount), subtotal: Number(order.subtotal) },
    });
  } catch (error) {
    console.error("[GET /api/admin/orders/[id]]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
