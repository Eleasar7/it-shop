// app/api/account/profile/route.ts
// PATCH /api/account/profile – update user profile fields

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

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
