// app/api/admin/customers/route.ts
// Security: requireAdmin() outside try/catch so NEXT_REDIRECT propagates.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();

  try {
    const customers = await prisma.user.findMany({
      where:   { role: "USER" },
      orderBy: { createdAt: "desc" },
      select: {
        id:        true,
        email:     true,
        name:      true,
        company:   true,
        createdAt: true,
        _count:    { select: { orders: true } },
      },
    });

    return NextResponse.json({ data: customers });
  } catch (error) {
    console.error("[GET /api/admin/customers]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
