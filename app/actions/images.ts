"use server";

/**
 * app/actions/images.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server actions for the product media management system.
 *
 * IMAGE RIGHTS NOTICE:
 * All image URLs imported via CSV must originate from:
 *   • Official manufacturer press/asset portals
 *   • Authorised distributor or supplier image feeds
 *   • Your own Supabase Storage uploads
 * Never import URLs scraped from retail sites or search engines.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import {
  validateImageFile,
  validateImageUrl,
  generateImageFilename,
  parseCsvImageRows,
  MAX_IMAGES_PER_PRODUCT,
  MAX_FILE_SIZE_BYTES,
  STORAGE_BUCKET,
} from "@/lib/images";

// ── Upload a single product image to Supabase Storage ─────────────────────────

export async function uploadProductImage(
  _prev: { url?: string; error?: string },
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;

  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt." };

  // Validate
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
        // Cache uploaded product images for 1 year (they're content-addressed by timestamp)
        cacheControl: "31536000",
      });

    if (uploadError) {
      console.error("[uploadProductImage] Supabase error:", uploadError);
      return { error: `Upload fehlgeschlagen: ${uploadError.message}` };
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
    return { url: data.publicUrl };
  } catch (e) {
    console.error("[uploadProductImage]", e);
    return { error: "Upload-Fehler. Bitte erneut versuchen." };
  }
}

// ── Delete an image from Supabase Storage ─────────────────────────────────────

export async function deleteProductImageFromStorage(
  imageUrl: string
): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    const supabase = await createSupabaseServer();
    // Extract the path within the bucket from the public URL
    // Public URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/object/public/${STORAGE_BUCKET}/`);
    if (pathParts.length < 2) {
      // Not a Supabase Storage URL – nothing to delete from storage
      return {};
    }
    const storagePath = pathParts[1];
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    if (error) {
      console.warn("[deleteProductImageFromStorage] Could not delete:", error.message);
      // Don't fail the whole operation – the DB record will still be updated
    }
    return {};
  } catch (e) {
    console.warn("[deleteProductImageFromStorage]", e);
    return {};
  }
}

// ── Reorder product images ─────────────────────────────────────────────────────

export async function reorderProductImages(
  productId: string,
  images: string[]
): Promise<{ error?: string }> {
  await requireAdmin();

  if (!productId) return { error: "Produkt-ID fehlt." };
  if (!Array.isArray(images)) return { error: "Ungültige Bildreihenfolge." };

  const clamped = images.slice(0, MAX_IMAGES_PER_PRODUCT);

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { images: clamped, updatedAt: new Date() },
    });
    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath(`/products`);
    return {};
  } catch (e) {
    console.error("[reorderProductImages]", e);
    return { error: "Fehler beim Speichern der Bildreihenfolge." };
  }
}

// ── Set main image (move to index 0) ─────────────────────────────────────────

export async function setMainProductImage(
  productId: string,
  imageUrl: string
): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    });
    if (!product) return { error: "Produkt nicht gefunden." };

    const reordered = [
      imageUrl,
      ...product.images.filter((u) => u !== imageUrl),
    ];

    await prisma.product.update({
      where: { id: productId },
      data: { images: reordered, updatedAt: new Date() },
    });
    revalidatePath(`/admin/products/${productId}/edit`);
    return {};
  } catch (e) {
    console.error("[setMainProductImage]", e);
    return { error: "Fehler beim Setzen des Hauptbildes." };
  }
}

// ── Remove a single image from a product ─────────────────────────────────────

export async function removeProductImage(
  productId: string,
  imageUrl: string,
  deleteFromStorage = false
): Promise<{ error?: string }> {
  await requireAdmin();

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    });
    if (!product) return { error: "Produkt nicht gefunden." };

    const updated = product.images.filter((u) => u !== imageUrl);

    await prisma.product.update({
      where: { id: productId },
      data: { images: updated, updatedAt: new Date() },
    });

    if (deleteFromStorage) {
      await deleteProductImageFromStorage(imageUrl);
    }

    revalidatePath(`/admin/products/${productId}/edit`);
    revalidatePath(`/products`);
    return {};
  } catch (e) {
    console.error("[removeProductImage]", e);
    return { error: "Fehler beim Entfernen des Bildes." };
  }
}

// ── Add image URL to a product ────────────────────────────────────────────────

export async function addProductImageUrl(
  productId: string,
  imageUrl: string
): Promise<{ error?: string }> {
  await requireAdmin();

  const urlValidation = validateImageUrl(imageUrl);
  if (!urlValidation.valid) return { error: urlValidation.error };

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    });
    if (!product) return { error: "Produkt nicht gefunden." };

    if (product.images.length >= MAX_IMAGES_PER_PRODUCT) {
      return { error: `Maximal ${MAX_IMAGES_PER_PRODUCT} Bilder pro Produkt erlaubt.` };
    }

    if (product.images.includes(imageUrl)) {
      return { error: "Diese URL ist bereits vorhanden." };
    }

    await prisma.product.update({
      where: { id: productId },
      data: { images: [...product.images, imageUrl], updatedAt: new Date() },
    });

    revalidatePath(`/admin/products/${productId}/edit`);
    return {};
  } catch (e) {
    console.error("[addProductImageUrl]", e);
    return { error: "Fehler beim Hinzufügen des Bildes." };
  }
}

// ── Bulk CSV image import ─────────────────────────────────────────────────────

export interface BulkImageImportResult {
  processed: number;
  updated: number;
  notFound: string[];
  errors: Array<{ sku: string; error: string }>;
}

/**
 * Processes a CSV file with columns: sku,image1,image2,...,image8
 * and updates matching products' image arrays.
 *
 * IMPORTANT: URLs in the CSV must be from approved manufacturer/supplier feeds.
 * This function does NOT validate whether images are actually accessible or
 * whether you have commercial rights to use them.
 */
export async function bulkImportImages(
  _prev: BulkImageImportResult | null,
  formData: FormData
): Promise<BulkImageImportResult> {
  await requireAdmin();

  const result: BulkImageImportResult = {
    processed: 0,
    updated: 0,
    notFound: [],
    errors: [],
  };

  const file = formData.get("csv") as File | null;
  if (!file || file.size === 0) {
    result.errors.push({ sku: "", error: "Keine CSV-Datei ausgewählt." });
    return result;
  }

  if (file.size > 5 * 1024 * 1024) {
    result.errors.push({ sku: "", error: "CSV zu groß (max. 5 MB)." });
    return result;
  }

  let csvText: string;
  try {
    csvText = await file.text();
  } catch {
    result.errors.push({ sku: "", error: "CSV konnte nicht gelesen werden." });
    return result;
  }

  const rows = parseCsvImageRows(csvText);
  if (rows.length === 0) {
    result.errors.push({ sku: "", error: "CSV enthält keine gültigen Zeilen." });
    return result;
  }

  for (const row of rows) {
    result.processed++;

    if (row.errors.length > 0) {
      result.errors.push({ sku: row.sku, error: row.errors.join("; ") });
      continue;
    }

    if (row.images.length === 0) continue;

    try {
      const product = await prisma.product.findFirst({
        where: { sku: row.sku },
        select: { id: true, images: true },
      });

      if (!product) {
        result.notFound.push(row.sku);
        continue;
      }

      // Merge: prepend new images, keep existing ones that aren't in the new list
      const existing = product.images.filter((u) => !row.images.includes(u));
      const merged = [...row.images, ...existing].slice(0, MAX_IMAGES_PER_PRODUCT);

      await prisma.product.update({
        where: { id: product.id },
        data: { images: merged, updatedAt: new Date() },
      });

      result.updated++;
    } catch (e) {
      console.error("[bulkImportImages] Error for SKU", row.sku, e);
      result.errors.push({ sku: row.sku, error: "Datenbankfehler." });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return result;
}

// ── Replace an existing image with a new upload ───────────────────────────────

export async function replaceProductImage(
  _prev: { url?: string; error?: string },
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;
  const oldUrl = formData.get("oldUrl") as string | null;

  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt." };
  if (!productId) return { error: "Produkt-ID fehlt." };

  const validation = validateImageFile(file);
  if (!validation.valid) return { error: validation.error };

  const filename = generateImageFilename(file, productId);

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
    const newUrl = data.publicUrl;

    // Update the product's image array
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    });

    if (product) {
      const updated = oldUrl
        ? product.images.map((u) => (u === oldUrl ? newUrl : u))
        : [...product.images, newUrl];

      await prisma.product.update({
        where: { id: productId },
        data: { images: updated, updatedAt: new Date() },
      });

      // Try to clean up old storage file
      if (oldUrl) await deleteProductImageFromStorage(oldUrl);
    }

    revalidatePath(`/admin/products/${productId}/edit`);
    return { url: newUrl };
  } catch (e) {
    console.error("[replaceProductImage]", e);
    return { error: "Fehler beim Ersetzen des Bildes." };
  }
}
