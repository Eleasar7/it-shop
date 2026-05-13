// app/api/notifications/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  await requireAdmin();
  try {
    const notifications = await prisma.notification.findMany({
      where:   { isRead: false },
      orderBy: { createdAt: "desc" },
      take:    20,
    });
    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function PATCH() {
  await requireAdmin();
  try {
    await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PATCH /api/notifications]", error);
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}
