/**
 * lib/images.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared image utilities for the IT-Shop media management system.
 *
 * IMPORTANT – Image rights notice:
 * ─────────────────────────────────────────────────────────────────────────────
 * Product images must come from:
 *   • Manufacturer official press/asset portals (Apple, Dell, HP, Lenovo, etc.)
 *   • Your authorised distributor or supplier image feeds (Ingram, Tech Data, etc.)
 *   • Your own photography / studio shots stored in Supabase Storage
 *
 * DO NOT scrape or hotlink images from:
 *   • Retailer product pages (Amazon, MediaMarkt, …)
 *   • Google Images or other search engines
 *   • Any site without an explicit commercial-use licence
 *
 * Using copyrighted product images without permission violates the rights of
 * the copyright holder and may result in legal action.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Max images allowed per product (mirrors the UI limit of 8) */
export const MAX_IMAGES_PER_PRODUCT = 8;

/** Max file size for direct upload: 8 MB */
export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

/** Allowed MIME types */
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

/** Allowed extensions (for CSV import and URL hints) */
export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "avif"];

/** Supabase Storage bucket name */
export const STORAGE_BUCKET = "product-images";

// ── Category fallback images ──────────────────────────────────────────────────
/**
 * Neutral placeholder SVGs by category slug.
 * These are used when a product has no images.
 * They are served as data URIs so no external dependency is needed.
 *
 * NOTE: These are generic tech silhouettes – safe to use commercially.
 * Replace with actual category images from your own photo library or
 * approved manufacturer asset packs.
 */
export const CATEGORY_FALLBACKS: Record<string, string> = {
  smartphones:   "/placeholders/smartphone.svg",
  tablets:       "/placeholders/tablet.svg",
  laptops:       "/placeholders/laptop.svg",
  pcs:           "/placeholders/pc.svg",
  desktops:      "/placeholders/pc.svg",
  monitors:      "/placeholders/monitor.svg",
  keyboards:     "/placeholders/keyboard.svg",
  mice:          "/placeholders/mouse.svg",
  headphones:    "/placeholders/headphones.svg",
  audio:         "/placeholders/headphones.svg",
  cameras:       "/placeholders/camera.svg",
  printers:      "/placeholders/printer.svg",
  networking:    "/placeholders/network.svg",
  server:        "/placeholders/server.svg",
  storage:       "/placeholders/storage.svg",
  components:    "/placeholders/component.svg",
  accessories:   "/placeholders/accessory.svg",
  gaming:        "/placeholders/gamepad.svg",
  wearables:     "/placeholders/watch.svg",
  software:      "/placeholders/software.svg",
  default:       "/placeholders/product.svg",
};

/**
 * Returns the best fallback image for a given category slug.
 * Tries exact match, then partial match, then falls back to generic.
 */
export function getCategoryFallback(categorySlug?: string): string {
  if (!categorySlug) return CATEGORY_FALLBACKS.default;
  const slug = categorySlug.toLowerCase();
  if (CATEGORY_FALLBACKS[slug]) return CATEGORY_FALLBACKS[slug];
  // Try partial match
  for (const [key, url] of Object.entries(CATEGORY_FALLBACKS)) {
    if (key !== "default" && (slug.includes(key) || key.includes(slug))) {
      return url;
    }
  }
  return CATEGORY_FALLBACKS.default;
}

/**
 * Returns the first valid image URL from a product's image array,
 * or the category fallback if none exist.
 */
export function getProductMainImage(
  images: string[],
  categorySlug?: string
): string {
  const first = images.find((u) => u && u.trim());
  return first ?? getCategoryFallback(categorySlug);
}

// ── Validation ────────────────────────────────────────────────────────────────

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a File object before uploading.
 * Returns { valid: true } or { valid: false, error: "..." }
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!file || file.size === 0) {
    return { valid: false, error: "Keine Datei ausgewählt." };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: `Nicht erlaubter Dateityp: ${file.type || "unbekannt"}. Erlaubt: JPEG, PNG, WebP, GIF, AVIF.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `Datei zu groß (${mb} MB). Maximale Größe: ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validates a URL string for use as a product image.
 * Returns { valid: true } or { valid: false, error: "..." }
 *
 * NOTE: This only validates the URL format, not whether the image actually
 * loads or whether you have rights to use it. Always ensure URLs come from
 * approved manufacturer/supplier sources.
 */
export function validateImageUrl(url: string): ImageValidationResult {
  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: false, error: "URL darf nicht leer sein." };
  }

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "URL muss mit http:// oder https:// beginnen." };
    }
  } catch {
    return { valid: false, error: "Ungültige URL." };
  }

  // Optional: check extension hint (not strictly required since URLs may not have extensions)
  const lower = trimmed.toLowerCase();
  const hasImageExtension = ALLOWED_EXTENSIONS.some(
    (ext) => lower.endsWith(`.${ext}`) || lower.includes(`.${ext}?`)
  );
  if (!hasImageExtension && !lower.includes("supabase") && !lower.includes("cloudinary")) {
    // Soft warning only – don't block valid CDN URLs without extensions
    // This is a hint, not a hard error
  }

  return { valid: true };
}

// ── Filename helpers ───────────────────────────────────────────────────────────

/**
 * Generates a unique storage filename for a product image.
 * Format: products/{productId}/{timestamp}-{random}.{ext}
 */
export function generateImageFilename(
  file: File,
  productId?: string
): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const random = Math.random().toString(36).slice(2, 8);
  const ts = Date.now();
  const folder = productId ? `products/${productId}` : "products/uploads";
  return `${folder}/${ts}-${random}.${ext}`;
}

// ── CSV Import helpers ─────────────────────────────────────────────────────────

export interface CsvImageRow {
  sku: string;
  images: string[]; // up to 8 valid image URLs
  errors: string[];
}

/**
 * Parses a CSV string with columns: sku,image1,image2,...,image8
 * Returns an array of CsvImageRow objects.
 *
 * Expected CSV format:
 *   sku,image1,image2,image3,image4,image5,image6,image7,image8
 *   PROD-001,https://...,https://...,...
 *
 * IMPORTANT: URLs must come from authorised manufacturer/distributor image feeds.
 * Do not import URLs scraped from other retail or search sites.
 */
export function parseCsvImageRows(csvText: string): CsvImageRow[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  // Parse header to find column indices
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const skuIdx = header.indexOf("sku");
  if (skuIdx === -1) {
    return [{ sku: "", images: [], errors: ["CSV hat keine 'sku' Spalte."] }];
  }

  const imageIndices: number[] = [];
  for (let i = 1; i <= MAX_IMAGES_PER_PRODUCT; i++) {
    const idx = header.indexOf(`image${i}`);
    if (idx !== -1) imageIndices.push(idx);
  }

  const rows: CsvImageRow[] = [];

  for (let lineNum = 1; lineNum < lines.length; lineNum++) {
    const cols = splitCsvLine(lines[lineNum]);
    const sku = cols[skuIdx]?.trim() ?? "";
    if (!sku) continue;

    const images: string[] = [];
    const errors: string[] = [];

    for (const imgIdx of imageIndices) {
      const url = cols[imgIdx]?.trim() ?? "";
      if (!url) continue;

      const validation = validateImageUrl(url);
      if (!validation.valid) {
        errors.push(`Spalte image${imageIndices.indexOf(imgIdx) + 1}: ${validation.error}`);
      } else {
        images.push(url);
        if (images.length >= MAX_IMAGES_PER_PRODUCT) break;
      }
    }

    rows.push({ sku, images, errors });
  }

  return rows;
}

/** Handles quoted CSV fields correctly */
function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Optimization guidance ──────────────────────────────────────────────────────
/**
 * IMAGE OPTIMIZATION NOTES:
 *
 * 1. BEFORE UPLOAD: Resize images to max 1600×1600 px (product display max is 800px).
 *    Tools: Squoosh, ImageMagick, Sharp (Node.js), or your CMS.
 *
 * 2. FORMAT: Prefer WebP or AVIF over JPEG/PNG for 30–50% smaller file sizes.
 *    Most modern cameras/phones can export WebP directly.
 *
 * 3. COMPRESSION: Target 80–90 quality for WebP, 85 for JPEG.
 *    Aim for < 300 KB per image for fast shop load times.
 *
 * 4. NEXT.JS: The <Image> component automatically:
 *    - Serves WebP/AVIF to supported browsers
 *    - Applies lazy loading
 *    - Generates responsive srcsets
 *    Make sure remotePatterns in next.config.ts includes your Supabase domain.
 *
 * 5. SUPABASE STORAGE: Consider enabling the Supabase Image Transformation feature
 *    (part of the Pro plan) to resize/optimize images on-the-fly via URL params:
 *    ?width=400&quality=80
 *    Docs: https://supabase.com/docs/guides/storage/serving/image-transformations
 */
