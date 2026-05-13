// app/api/auth/sync-user/route.ts
// Called after registration to sync user into our Prisma DB

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const syncSchema = z.object({
  id:    z.string().uuid(),
  email: z.string().email(),
  name:  z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = syncSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    const { id, email, name } = parsed.data;

    await prisma.user.upsert({
      where: { id },
      update: { email, ...(name ? { name } : {}) },
      create: { id, email, name: name ?? null, role: "USER" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[sync-user]", error);
    // Don't fail the registration flow – user still exists in Supabase
    // and will be auto-created on first getCurrentUser() call
    return NextResponse.json({ ok: true });
  }
}
