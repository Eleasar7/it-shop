"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type SupplierFormState = { error?: string; success?: boolean; id?: string };

const supplierSchema = z.object({
  name:        z.string().min(1).max(255),
  contactName: z.string().optional(),
  email:       z.string().email().optional(),
  phone:       z.string().optional(),
  website:     z.string().url().optional().or(z.literal("")),
  address:     z.string().optional(),
  notes:       z.string().optional(),
  isActive:    z.preprocess((v) => v === "true" || v === true, z.boolean()).default(true),
});

function parseSupplierForm(fd: FormData) {
  return {
    name:        fd.get("name"),
    contactName: fd.get("contactName") || undefined,
    email:       fd.get("email")       || undefined,
    phone:       fd.get("phone")       || undefined,
    website:     fd.get("website")     || "",
    address:     fd.get("address")     || undefined,
    notes:       fd.get("notes")       || undefined,
    isActive:    fd.get("isActive") !== "false",
  };
}

export async function createSupplier(_prev: SupplierFormState, fd: FormData): Promise<SupplierFormState> {
  await requireAdmin();
  const parsed = supplierSchema.safeParse(parseSupplierForm(fd));
  if (!parsed.success) return { error: "Ungültige Eingaben." };
  try {
    const supplier = await prisma.supplier.create({ data: parsed.data });
    revalidatePath("/admin/suppliers");
    redirect(`/admin/suppliers/${supplier.id}`);
  } catch (e) {
    console.error("[createSupplier]", e);
    return { error: "Datenbankfehler." };
  }
}

export async function updateSupplier(id: string, _prev: SupplierFormState, fd: FormData): Promise<SupplierFormState> {
  await requireAdmin();
  const parsed = supplierSchema.safeParse(parseSupplierForm(fd));
  if (!parsed.success) return { error: "Ungültige Eingaben." };
  try {
    await prisma.supplier.update({ where: { id }, data: parsed.data });
    revalidatePath(`/admin/suppliers/${id}`);
    revalidatePath("/admin/suppliers");
    return { success: true };
  } catch (e) {
    console.error("[updateSupplier]", e);
    return { error: "Datenbankfehler." };
  }
}

// Purchase orders
const poItemSchema = z.object({
  productId:   z.string().optional(),
  productName: z.string().min(1),
  productSku:  z.string().optional(),
  unitCost:    z.number().min(0),
  quantity:    z.number().int().min(1),
});

const poSchema = z.object({
  supplierId:  z.string().cuid(),
  notes:       z.string().optional(),
  expectedAt:  z.string().optional(),
  items:       z.array(poItemSchema).min(1),
});

export async function createPurchaseOrder(_prev: SupplierFormState, fd: FormData): Promise<SupplierFormState> {
  await requireAdmin();
  const itemsRaw = fd.get("items");
  const raw = {
    supplierId: fd.get("supplierId"),
    notes:      fd.get("notes")      || undefined,
    expectedAt: fd.get("expectedAt") || undefined,
    items:      itemsRaw ? JSON.parse(itemsRaw as string) : [],
  };
  const parsed = poSchema.safeParse(raw);
  if (!parsed.success) return { error: "Ungültige Eingaben." };

  const { items, expectedAt, ...rest } = parsed.data;
  const totalAmount = items.reduce((s, i) => s + i.unitCost * i.quantity, 0);

  try {
    const po = await prisma.purchaseOrder.create({
      data: {
        ...rest,
        subtotal:    totalAmount,
        totalAmount,
        expectedAt:  expectedAt ? new Date(expectedAt) : null,
        items: {
          create: items.map((item) => ({
            ...item,
            productId: item.productId || null,
            totalCost: Math.round(item.unitCost * item.quantity * 100) / 100,
          })),
        },
      },
    });
    revalidatePath("/admin/purchase-orders");
    redirect(`/admin/purchase-orders/${po.id}`);
  } catch (e) {
    console.error("[createPurchaseOrder]", e);
    return { error: "Datenbankfehler." };
  }
}
