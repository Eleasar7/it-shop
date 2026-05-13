// app/api/checkout/route.ts
// POST /api/checkout – Stripe Checkout Session erstellen
// ⚠️ Preise werden IMMER aus der DB geladen – niemals vom Client übernommen!

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations";
import type { Stripe } from "stripe";

export async function POST(request: Request) {
  try {
    // 1. Auth prüfen
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // 2. Request-Body parsen & validieren
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items } = parsed.data;

    // 3. Produkte aus DB laden – serverseitige Preisvalidierung!
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    // Prüfen ob alle Produkte existieren
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Ein oder mehrere Produkte nicht gefunden oder nicht verfügbar" },
        { status: 400 }
      );
    }

    // 4. Lagerbestand prüfen
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Nicht genügend Lagerbestand für "${product.name}". Verfügbar: ${product.stock}`,
          },
          { status: 400 }
        );
      }
    }

    // 5. Stripe Line Items aus DB-Preisen aufbauen
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const product = products.find((p) => p.id === item.productId)!;
        const unitAmountInCents = Math.round(Number(product.price) * 100);

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: product.name,
              images: product.images.slice(0, 1), // Max 1 Bild für Stripe
              metadata: {
                productId: product.id,
                sku: product.sku ?? "",
              },
            },
            unit_amount: unitAmountInCents,
          },
          quantity: item.quantity,
        };
      }
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // 6. Stripe Session erstellen
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: authUser.email ?? undefined,
      currency: "eur",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["DE", "AT", "CH"],
      },
      metadata: {
        userId: authUser.id,
        items: JSON.stringify(items), // Für Webhook
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      // Zahlungsmethoden für DE
      payment_method_types: ["card", "sepa_debit", "klarna"],
      // Note: "sofort" was discontinued by Stripe in 2024
    });

    return NextResponse.json({ url: stripeSession.url, sessionId: stripeSession.id });
  } catch (error) {
    console.error("[POST /api/checkout]", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
