"use server";

// app/actions/quotes.ts

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// ─── Schemas ─────────────────────────────────────────────────────────────────

const quoteItemSchema = z.object({
  productId:   z.string().optional(),
  productName: z.string().min(1),
  productSku:  z.string().optional(),
  imageUrl:    z.string().optional(),
  unitPrice:   z.number().min(0),
  quantity:    z.number().int().min(1),
  note:        z.string().optional(),
});

const quoteSchema = z.object({
  customerEmail:   z.string().email(),
  customerName:    z.string().optional(),
  customerCompany: z.string().optional(),
  customerVatId:   z.string().optional(),
  customerPhone:   z.string().optional(),
  userId:          z.string().optional(),
  b2bRequestId:    z.string().optional(),
  taxRate:         z.number().min(0).max(1).default(0.19),
  currency:        z.string().default("EUR"),
  notes:           z.string().optional(),
  adminNotes:      z.string().optional(),
  validUntil:      z.string().optional(), // ISO date string
  items:           z.array(quoteItemSchema).min(1),
});

export type QuoteFormState = {
  error?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
  quoteId?: string;
};

// ─── Compute totals ───────────────────────────────────────────────────────────

function computeTotals(
  items: Array<{ unitPrice: number; quantity: number }>,
  taxRate: number
) {
  const subtotal    = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const taxAmount   = Math.round(subtotal * taxRate * 100) / 100;
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
  return { subtotal, taxAmount, totalAmount };
}

// ─── Create quote ─────────────────────────────────────────────────────────────

export async function createQuote(
  _prev: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  await requireAdmin();

  const itemsRaw = formData.get("items");
  const raw = {
    customerEmail:   formData.get("customerEmail"),
    customerName:    formData.get("customerName") || undefined,
    customerCompany: formData.get("customerCompany") || undefined,
    customerVatId:   formData.get("customerVatId") || undefined,
    customerPhone:   formData.get("customerPhone") || undefined,
    userId:          formData.get("userId") || undefined,
    b2bRequestId:    formData.get("b2bRequestId") || undefined,
    taxRate:         Number(formData.get("taxRate") || 0.19),
    notes:           formData.get("notes") || undefined,
    adminNotes:      formData.get("adminNotes") || undefined,
    validUntil:      formData.get("validUntil") || undefined,
    items:           itemsRaw ? JSON.parse(itemsRaw as string) : [],
  };

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Ungültige Eingaben.", errors: parsed.error.flatten().fieldErrors };
  }

  const { items, taxRate, validUntil, ...rest } = parsed.data;
  const { subtotal, taxAmount, totalAmount } = computeTotals(items, taxRate);

  try {
    const quote = await prisma.quote.create({
      data: {
        ...rest,
        taxRate,
        subtotal,
        taxAmount,
        totalAmount,
        validUntil: validUntil ? new Date(validUntil) : null,
        items: {
          create: items.map((item) => ({
            ...item,
            productId: item.productId || null,
            totalPrice: Math.round(item.unitPrice * item.quantity * 100) / 100,
          })),
        },
      },
    });

    revalidatePath("/admin/quotes");
    return { success: true, quoteId: quote.id };
  } catch (e) {
    console.error("[createQuote]", e);
    return { error: "Datenbankfehler beim Erstellen des Angebots." };
  }
}

// ─── Update quote ─────────────────────────────────────────────────────────────

export async function updateQuote(
  id: string,
  _prev: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  await requireAdmin();

  const itemsRaw = formData.get("items");
  const raw = {
    customerEmail:   formData.get("customerEmail"),
    customerName:    formData.get("customerName") || undefined,
    customerCompany: formData.get("customerCompany") || undefined,
    customerVatId:   formData.get("customerVatId") || undefined,
    customerPhone:   formData.get("customerPhone") || undefined,
    taxRate:         Number(formData.get("taxRate") || 0.19),
    notes:           formData.get("notes") || undefined,
    adminNotes:      formData.get("adminNotes") || undefined,
    validUntil:      formData.get("validUntil") || undefined,
    items:           itemsRaw ? JSON.parse(itemsRaw as string) : [],
  };

  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Ungültige Eingaben.", errors: parsed.error.flatten().fieldErrors };
  }

  const { items, taxRate, validUntil, ...rest } = parsed.data;
  const { subtotal, taxAmount, totalAmount } = computeTotals(items, taxRate);

  try {
    await prisma.$transaction([
      // Delete existing items, recreate
      prisma.quoteItem.deleteMany({ where: { quoteId: id } }),
      prisma.quote.update({
        where: { id },
        data: {
          ...rest,
          taxRate,
          subtotal,
          taxAmount,
          totalAmount,
          validUntil: validUntil ? new Date(validUntil) : null,
          items: {
            create: items.map((item) => ({
              ...item,
              productId: item.productId || null,
              totalPrice: Math.round(item.unitPrice * item.quantity * 100) / 100,
            })),
          },
        },
      }),
    ]);

    revalidatePath(`/admin/quotes/${id}`);
    revalidatePath("/admin/quotes");
    return { success: true, quoteId: id };
  } catch (e) {
    console.error("[updateQuote]", e);
    return { error: "Datenbankfehler beim Aktualisieren." };
  }
}

// ─── Update quote status ──────────────────────────────────────────────────────

const statusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]),
  adminNotes: z.string().optional(),
});

export async function updateQuoteStatus(
  id: string,
  _prev: QuoteFormState,
  formData: FormData
): Promise<QuoteFormState> {
  await requireAdmin();

  const parsed = statusSchema.safeParse({
    status:     formData.get("status"),
    adminNotes: formData.get("adminNotes") || undefined,
  });
  if (!parsed.success) return { error: "Ungültiger Status." };

  try {
    await prisma.quote.update({ where: { id }, data: parsed.data });
    revalidatePath(`/admin/quotes/${id}`);
    revalidatePath("/admin/quotes");
    return { success: true };
  } catch (e) {
    console.error("[updateQuoteStatus]", e);
    return { error: "Datenbankfehler." };
  }
}

// ─── Accept/reject quote (customer action via access token) ──────────────────

export async function customerRespondToQuote(
  accessToken: string,
  response: "ACCEPTED" | "REJECTED"
): Promise<{ success: boolean; error?: string }> {
  try {
    const quote = await prisma.quote.findUnique({
      where: { accessToken },
      select: { id: true, status: true, validUntil: true },
    });
    if (!quote) return { success: false, error: "Angebot nicht gefunden." };
    if (quote.status !== "SENT") return { success: false, error: "Dieses Angebot kann nicht mehr geändert werden." };
    if (quote.validUntil && quote.validUntil < new Date()) {
      return { success: false, error: "Dieses Angebot ist abgelaufen." };
    }

    await prisma.quote.update({
      where: { id: quote.id },
      data:  { status: response },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        type:    response === "ACCEPTED" ? "QUOTE_ACCEPTED" : "QUOTE_REJECTED",
        title:   response === "ACCEPTED" ? "Angebot akzeptiert" : "Angebot abgelehnt",
        message: `Angebot ${quote.id.slice(-6).toUpperCase()} wurde vom Kunden ${response === "ACCEPTED" ? "akzeptiert" : "abgelehnt"}.`,
        link:    `/admin/quotes/${quote.id}`,
      },
    });

    return { success: true };
  } catch (e) {
    console.error("[customerRespondToQuote]", e);
    return { success: false, error: "Fehler beim Verarbeiten." };
  }
}

// ─── Delete quote ─────────────────────────────────────────────────────────────

export async function deleteQuote(id: string): Promise<QuoteFormState> {
  await requireAdmin();
  try {
    await prisma.quote.delete({ where: { id } });
    revalidatePath("/admin/quotes");
    return { success: true };
  } catch (e) {
    console.error("[deleteQuote]", e);
    return { error: "Fehler beim Löschen." };
  }
}
