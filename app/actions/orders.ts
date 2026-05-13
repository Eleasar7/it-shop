"use server";

// app/actions/orders.ts

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth";

// ─── Schema ──────────────────────────────────────────────────────────────────

const updateSchema = z.object({
  status: z.enum([
    "PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED","REFUNDED",
  ]),
  paymentStatus: z.enum([
    "PENDING","PAID","FAILED","REFUNDED","PARTIALLY_REFUNDED",
  ]),
  adminNotes:       z.string().optional(),
  trackingNumber:   z.string().optional(),
  shippingProvider: z.string().optional(),
});

export type OrderUpdateState = { error?: string; success?: boolean };

// ─── Admin: update order status + tracking ───────────────────────────────────

export async function updateOrderStatus(
  id: string,
  _prev: OrderUpdateState,
  formData: FormData
): Promise<OrderUpdateState> {
  const admin = await requireAdmin();

  const raw = {
    status:           formData.get("status"),
    paymentStatus:    formData.get("paymentStatus"),
    adminNotes:       formData.get("adminNotes") || undefined,
    trackingNumber:   formData.get("trackingNumber") || undefined,
    shippingProvider: formData.get("shippingProvider") || undefined,
  };

  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) return { error: "Ungültige Statuswerte." };

  try {
    // Fetch current order to diff for timeline
    const current = await prisma.order.findUnique({
      where: { id },
      select: { status: true, paymentStatus: true },
    });
    if (!current) return { error: "Bestellung nicht gefunden." };

    const timelineEntries: Array<{
      orderId: string; event: string; message: string;
      oldValue?: string; newValue?: string; createdBy: string;
    }> = [];

    if (current.status !== parsed.data.status) {
      const STATUS_LABEL: Record<string, string> = {
        PENDING: "Ausstehend", CONFIRMED: "Bestätigt", PROCESSING: "In Bearbeitung",
        SHIPPED: "Versendet", DELIVERED: "Geliefert", CANCELLED: "Storniert", REFUNDED: "Erstattet",
      };
      timelineEntries.push({
        orderId:   id,
        event:     "STATUS_CHANGED",
        message:   `Status geändert: ${STATUS_LABEL[current.status] ?? current.status} → ${STATUS_LABEL[parsed.data.status] ?? parsed.data.status}`,
        oldValue:  current.status,
        newValue:  parsed.data.status,
        createdBy: admin.id,
      });
    }

    if (parsed.data.trackingNumber) {
      timelineEntries.push({
        orderId:   id,
        event:     "TRACKING_ADDED",
        message:   `Sendungsverfolgung hinzugefügt: ${parsed.data.trackingNumber}${parsed.data.shippingProvider ? ` (${parsed.data.shippingProvider})` : ""}`,
        newValue:  parsed.data.trackingNumber,
        createdBy: admin.id,
      });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data:  {
          status:           parsed.data.status,
          paymentStatus:    parsed.data.paymentStatus,
          adminNotes:       parsed.data.adminNotes,
          trackingNumber:   parsed.data.trackingNumber,
          shippingProvider: parsed.data.shippingProvider,
        },
      }),
      ...timelineEntries.map((entry) =>
        prisma.orderTimeline.create({ data: entry })
      ),
    ]);

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e) {
    console.error("[updateOrderStatus]", e);
    return { error: "Datenbankfehler beim Aktualisieren." };
  }
}

// ─── Admin: quick-action helpers ─────────────────────────────────────────────

export async function markOrderShipped(
  id: string,
  trackingNumber: string,
  shippingProvider: string
): Promise<OrderUpdateState> {
  const admin = await requireAdmin();
  try {
    const order = await prisma.order.findUnique({ where: { id }, select: { status: true } });
    if (!order) return { error: "Bestellung nicht gefunden." };

    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data:  { status: "SHIPPED", trackingNumber, shippingProvider },
      }),
      prisma.orderTimeline.create({
        data: {
          orderId:   id,
          event:     "SHIPPED",
          message:   `Versendet mit ${shippingProvider}: ${trackingNumber}`,
          oldValue:  order.status,
          newValue:  "SHIPPED",
          createdBy: admin.id,
        },
      }),
    ]);

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e) {
    console.error("[markOrderShipped]", e);
    return { error: "Fehler beim Aktualisieren." };
  }
}

export async function cancelOrder(id: string): Promise<OrderUpdateState> {
  const admin = await requireAdmin();
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true, paymentStatus: true, items: { select: { productId: true, quantity: true } } },
    });
    if (!order) return { error: "Bestellung nicht gefunden." };
    if (order.status === "DELIVERED") return { error: "Gelieferte Bestellungen können nicht storniert werden." };

    // Restore stock for cancelled orders
    await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data:  { status: "CANCELLED" },
      }),
      // Only restore stock if payment was never made (or was refunded)
      ...(order.paymentStatus !== "PAID" ? order.items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data:  { stock: { increment: item.quantity } },
        })
      ) : []),
      prisma.orderTimeline.create({
        data: {
          orderId:   id,
          event:     "CANCELLED",
          message:   "Bestellung storniert",
          oldValue:  order.status,
          newValue:  "CANCELLED",
          createdBy: admin.id,
        },
      }),
    ]);

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e) {
    console.error("[cancelOrder]", e);
    return { error: "Fehler beim Stornieren." };
  }
}
