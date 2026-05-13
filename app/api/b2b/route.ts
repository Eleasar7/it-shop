// app/api/b2b/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { b2bRequestSchema } from "@/lib/validations";
import { getAuthUser } from "@/lib/auth";
import { sendB2BConfirmation, sendB2BAdminNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = b2bRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const authUser = await getAuthUser();

    await prisma.b2BRequest.create({
      data: {
        ...parsed.data,
        userId: authUser?.id ?? null,
        items: parsed.data.items ?? [],
      },
    });

    // Send B2B confirmation emails (non-blocking)
    const emailData = {
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      message: parsed.data.message,
      items: (parsed.data.items ?? []).map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
      })),
    };
    await Promise.allSettled([
      sendB2BConfirmation(emailData),
      sendB2BAdminNotification(emailData),
    ]).catch(() => {}); // never crash on email failure

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/b2b]", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
