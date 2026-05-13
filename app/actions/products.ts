"use server";

// app/actions/products.ts

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import {
  validateImageFile,
  generateImageFilename,
  STORAGE_BUCKET,
  MAX_IMAGES_PER_PRODUCT,
} from "@/lib/images";

const productSchema = z.object({
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  slug: z
    .string()
    .min(2, "Slug zu kurz")
    .regex(/^[a-z0-9-]+$/, "Slug: nur Kleinbuchstaben, Zahlen und Bindestriche"),
  brand: z.string().min(1, "Marke ist Pflicht"),
  sku: z.string().optional(),
  description: z.string().min(10, "Beschreibung muss mindestens 10 Zeichen haben"),
  price: z.coerce.number().positive("Preis muss positiv sein"),
  // FIX: empty string must become null, not throw
  comparePrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional()
  ),
  stock: z.coerce.number().int().min(0, "Bestand darf nicht negativ sein"),
  lowStockAlert: z.coerce.number().int().min(0).default(5),
  categoryId: z.string().min(1, "Kategorie ist Pflicht"),
  // FIX CRITICAL: z.coerce.boolean() makes Boolean('false') = true.
  // Use a preprocess that checks the string value explicitly.
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()).default(true),
  isFeatured: z.preprocess((v) => v === "true" || v === true, z.boolean()).default(false),
  tags: z.string().optional(),
  specs: z.string().optional(),
  images: z.string().optional(),
  weight: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().nullable().optional()
  ),
  purchasePrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().positive().nullable().optional()
  ),
  supplier: z.string().max(255).optional(),
  supplierSku: z.string().max(255).optional(),
});

export type ProductFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

function parseFormData(fd: FormData) {
  return {
    name: fd.get("name") as string,
    slug: fd.get("slug") as string,
    brand: fd.get("brand") as string,
    sku: (fd.get("sku") as string) || undefined,
    description: fd.get("description") as string,
    price: fd.get("price") as string,
    comparePrice: (fd.get("comparePrice") as string) || "",
    stock: fd.get("stock") as string,
    lowStockAlert: (fd.get("lowStockAlert") as string) || "5",
    categoryId: fd.get("categoryId") as string,
    isActive: fd.get("isActive") as string,
    isFeatured: fd.get("isFeatured") as string,
    tags: (fd.get("tags") as string) || "",
    specs: (fd.get("specs") as string) || "{}",
    images: (fd.get("images") as string) || "",
    weight:        (fd.get("weight") as string) || "",
    purchasePrice: (fd.get("purchasePrice") as string) || "",
    supplier:      (fd.get("supplier") as string) || undefined,
    supplierSku:   (fd.get("supplierSku") as string) || undefined,
  };
}

function buildProductData(
  validated: z.infer<typeof productSchema>,
  raw: ReturnType<typeof parseFormData>
) {
  let specs: Record<string, string | number | boolean> = {};
  try { specs = JSON.parse(raw.specs || "{}"); } catch { specs = {}; }

  const images = (raw.images || "").split("\n").map((u) => u.trim()).filter(Boolean);
  const tags = (raw.tags || "").split(",").map((t) => t.trim()).filter(Boolean);

  return {
    name: validated.name,
    slug: validated.slug,
    brand: validated.brand,
    sku: validated.sku || null,
    description: validated.description,
    price: validated.price,
    comparePrice: validated.comparePrice ?? null,
    stock: validated.stock,
    lowStockAlert: validated.lowStockAlert,
    categoryId: validated.categoryId,
    isActive: validated.isActive,
    isFeatured: validated.isFeatured,
    specs,
    images,
    tags,
    weight:        validated.weight ?? null,
    purchasePrice: validated.purchasePrice ?? null,
    supplier:      (validated as any).supplier || null,
    supplierSku:   (validated as any).supplierSku || null,
  };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const raw = parseFormData(formData);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Bitte alle Pflichtfelder korrekt ausfüllen.",
    };
  }
  try {
    const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return { errors: { slug: ["Dieser Slug ist bereits vergeben."] }, message: "Slug bereits vorhanden." };
    await prisma.product.create({ data: buildProductData(parsed.data, raw) });
  } catch (e) {
    console.error("[createProduct]", e);
    return { message: "Datenbankfehler beim Erstellen des Produkts." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?success=created");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const raw = parseFormData(formData);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      message: "Bitte alle Pflichtfelder korrekt ausfüllen.",
    };
  }
  try {
    const existing = await prisma.product.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
    if (existing) return { errors: { slug: ["Dieser Slug ist bereits vergeben."] }, message: "Slug bereits vorhanden." };
    await prisma.product.update({ where: { id }, data: buildProductData(parsed.data, raw) });
  } catch (e) {
    console.error("[updateProduct]", e);
    return { message: "Datenbankfehler beim Aktualisieren des Produkts." };
  }
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/products");
  revalidatePath("/");
  redirect("/admin/products?success=updated");
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      await prisma.product.update({ where: { id }, data: { isActive: false } });
    } else {
      await prisma.product.delete({ where: { id } });
    }
  } catch (e) {
    console.error("[deleteProduct]", e);
    return { error: "Fehler beim Löschen." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return {};
}

export async function archiveProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  } catch (e) {
    console.error("[archiveProduct]", e);
    return { error: "Fehler beim Archivieren." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return {};
}

export async function duplicateProduct(id: string): Promise<{ error?: string; newId?: string }> {
  await requireAdmin();
  try {
    const original = await prisma.product.findUnique({ where: { id } });
    if (!original) return { error: "Produkt nicht gefunden." };
    const baseSlug = original.slug.replace(/-kopie-\d+$/, "");
    const newSlug = `${baseSlug}-kopie-${Date.now()}`;
    const duplicate = await prisma.product.create({
      data: {
        name: `${original.name} (Kopie)`,
        slug: newSlug,
        brand: original.brand,
        sku: null,
        description: original.description,
        specs: original.specs ?? {},
        price: original.price,
        comparePrice: original.comparePrice,
        stock: 0,
        lowStockAlert: original.lowStockAlert,
        images: original.images,
        isActive: false,
        isFeatured: false,
        tags: original.tags,
        weight: original.weight,
        categoryId: original.categoryId,
      },
    });
    revalidatePath("/admin/products");
    return { newId: duplicate.id };
  } catch (e) {
    console.error("[duplicateProduct]", e);
    return { error: "Fehler beim Duplizieren." };
  }
}

export async function toggleProductField(
  id: string,
  field: "isActive" | "isFeatured",
  value: boolean
): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    await prisma.product.update({ where: { id }, data: { [field]: value } });
  } catch (e) {
    console.error("[toggleProductField]", e);
    return { error: "Fehler beim Aktualisieren." };
  }
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  return {};
}

export async function uploadProductImage(
  _prev: { url?: string; error?: string },
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;

  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt." };

  // Use shared validation from lib/images
  const validation = validateImageFile(file);
  if (!validation.valid) return { error: validation.error };

  const filename = generateImageFilename(file, productId ?? undefined);

  try {
    const supabase = await createSupabaseServer();
    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, bytes, {
        contentType: file.type,
        upsert: false,
        cacheControl: "31536000",
      });
    if (uploadError) return { error: `Upload fehlgeschlagen: ${uploadError.message}` };
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
    return { url: data.publicUrl };
  } catch (e) {
    console.error("[uploadProductImage]", e);
    return { error: "Upload-Fehler. Bitte erneut versuchen." };
  }
}
