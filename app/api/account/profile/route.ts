// app/api/account/profile/route.ts
// GET  /api/account/profile – return current user profile (used by Header)
// PATCH /api/account/profile – update user profile fields

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, name: true, role: true, company: true, phone: true },
    });

    if (!user) {
      // Row may not exist yet (edge case) – return minimal profile from Supabase
      return NextResponse.json({
        id: authUser.id,
        email: authUser.email ?? "",
        name: null,
        role: "USER",
        company: null,
        phone: null,
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET /api/account/profile]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

const updateSchema = z.object({
  name:    z.string().max(100).optional(),
  phone:   z.string().max(50).optional(),
  company: z.string().max(200).optional(),
});

export async function PATCH(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name:    parsed.data.name    ?? undefined,
        phone:   parsed.data.phone   ?? undefined,
        company: parsed.data.company ?? undefined,
      },
      select: { id: true, name: true, email: true, phone: true, company: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/account/profile]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
