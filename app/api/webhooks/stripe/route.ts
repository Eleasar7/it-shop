// app/api/webhooks/stripe/route.ts
// ⚠️ Raw body required for Stripe signature verification.
// ⚠️ This route must NOT be behind auth middleware.

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const sig  = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Keine Signatur" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.expired": {
        // Could mark any PENDING order as CANCELLED here if needed
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(pi);
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook-Verarbeitung fehlgeschlagen" },
      { status: 500 }
    );
  }
}

// ─── checkout.session.completed ──────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Idempotency guard
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing) {
    console.log(`[Webhook] Order for session ${session.id} already exists`);
    return;
  }

  const userId   = session.metadata?.userId;
  const itemsJson = session.metadata?.items;

  if (!userId || !itemsJson) {
    throw new Error("Missing metadata in Stripe session");
  }

  const requestedItems: Array<{ productId: string; quantity: number }> =
    JSON.parse(itemsJson);

  // ── Atomic stock-safe order creation ──────────────────────────────────────
  // Use a serializable transaction to prevent overselling.
  // We re-check stock inside the transaction and decrement atomically.
  await prisma.$transaction(
    async (tx) => {
      // Lock-read each product row to check stock
      const productIds = requestedItems.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      // Verify stock sufficiency and build item snapshots
      let subtotal = 0;
      const orderItems: Array<{
        productId: string;
        productName: string;
        productSku: string | null;
        imageUrl: string | null;
        unitPrice: number;
        quantity: number;
        totalPrice: number;
      }> = [];

      for (const requested of requestedItems) {
        const product = products.find((p) => p.id === requested.productId);
        if (!product) {
          throw new Error(`Product ${requested.productId} not found`);
        }

        // Hard stop on oversell — this guards against race conditions
        if (product.stock < requested.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}": ` +
            `requested ${requested.quantity}, available ${product.stock}`
          );
        }

        const unitPrice  = Number(product.price);
        const totalPrice = unitPrice * requested.quantity;
        subtotal += totalPrice;

        orderItems.push({
          productId:   product.id,
          productName: product.name,
          productSku:  product.sku ?? null,
          imageUrl:    product.images[0] ?? null,
          unitPrice,
          quantity:    requested.quantity,
          totalPrice,
        });
      }

      // German gross prices: VAT = subtotal × (19/119)
      const taxAmount   = Math.round((subtotal / 1.19) * 0.19 * 100) / 100;
      // Trust Stripe's amount_total (includes any shipping Stripe calculated)
      const totalAmount = Number(session.amount_total ?? 0) / 100;

      // Customer snapshot
      const customerDetails = session.customer_details;
      const customerEmail   = customerDetails?.email ?? session.customer_email ?? "";
      const customerName    = customerDetails?.name  ?? null;

      // Billing details if collected
      const billingSnapshot = session.customer_details ?? null;

      // Create order + items in one atomic write
      const order = await tx.order.create({
        data: {
          userId,
          customerEmail,
          customerName,
          stripeSessionId:  session.id,
          stripePaymentId:  session.payment_intent as string ?? null,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          subtotal,
          taxAmount,
          shippingCost:     0,
          totalAmount,
          status:           "CONFIRMED",
          paymentStatus:    "PAID",
          shippingSnapshot: customerDetails
	    ? JSON.parse(JSON.stringify(customerDetails))
 	    : undefined,
          billingSnapshot: billingSnapshot
	    ? JSON.parse(JSON.stringify(billingSnapshot))
            : undefined,
          items: { create: orderItems },
        },
      });

      // Decrement stock atomically and record movement
      for (const item of requestedItems) {
        const prod = await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
          select: { stock: true },
        });
        await tx.stockMovement.create({
          data: {
            productId:   item.productId,
            type:        "SALE",
            quantity:    -item.quantity,
            balanceAfter: prod.stock,
            reference:   order.id,
            reason:      `Verkauf Bestellung ${order.orderNumber}`,
            createdBy:   "system",
          },
        });
      }

      // Write initial timeline entry
      await tx.orderTimeline.create({
        data: {
          orderId:   order.id,
          event:     "ORDER_CREATED",
          message:   "Bestellung erstellt und Zahlung bestätigt",
          newValue:  "CONFIRMED",
          createdBy: "system",
        },
      });

      console.log(`[Webhook] Order ${order.orderNumber} created for user ${userId}`);

      // Create admin notification
      await tx.notification.create({
        data: {
          type:    "NEW_ORDER",
          title:   "Neue Bestellung",
          message: `Bestellung von ${customerEmail} über ${(totalAmount).toFixed(2)} €`,
          link:    `/admin/orders/${order.id}`,
        },
      });
    },
    {
      // Use SERIALIZABLE to prevent phantom reads during concurrent sessions
      isolationLevel: "Serializable",
      timeout: 15000,
    }
  );

  // Non-blocking emails — fetch the created order for email data
  try {
    const [user, orderRecord] = await Promise.all([
      prisma.user.findUnique({
        where:  { id: userId },
        select: { name: true, email: true },
      }),
      prisma.order.findFirst({
        where:  { stripeSessionId: session.id },
        select: {
          orderNumber: true, totalAmount: true,
          subtotal: true, shippingCost: true,
        },
      }),
    ]);

    if (user && orderRecord) {
      const requestedItemsList = requestedItems;
      const products = await prisma.product.findMany({
        where: { id: { in: requestedItemsList.map((i) => i.productId) } },
        select: { id: true, name: true, price: true },
      });

      const emailData = {
        orderNumber:   orderRecord.orderNumber,
        customerName:  user.name ?? user.email,
        customerEmail: user.email,
        items: requestedItemsList.map((i) => {
          const p = products.find((p) => p.id === i.productId)!;
          return {
            name:       p.name,
            quantity:   i.quantity,
            unitPrice:  Number(p.price),
            totalPrice: Number(p.price) * i.quantity,
          };
        }),
        subtotal:     Number(orderRecord.subtotal),
        shippingCost: Number(orderRecord.shippingCost),
        totalAmount:  Number(orderRecord.totalAmount),
        createdAt:    new Date(),
      };

      await Promise.allSettled([
        sendOrderConfirmation(emailData),
        sendAdminOrderNotification(emailData),
      ]);
    }
  } catch (emailErr) {
    console.error("[Webhook] Email failed (non-fatal):", emailErr);
  }
}

// ─── payment_intent.payment_failed ───────────────────────────────────────────

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  // Find any order tied to this payment intent and mark as failed
  try {
    const order = await prisma.order.findFirst({
      where: { stripePaymentId: pi.id },
    });
    if (!order) return;

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data:  { paymentStatus: "FAILED" },
      }),
      prisma.orderTimeline.create({
        data: {
          orderId:   order.id,
          event:     "PAYMENT_FAILED",
          message:   "Zahlung fehlgeschlagen",
          newValue:  "FAILED",
          createdBy: "system",
        },
      }),
    ]);
  } catch (err) {
    console.error("[Webhook] handlePaymentFailed:", err);
  }
}
