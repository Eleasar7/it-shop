/**
 * app/api/admin/products/images/route.ts
 *
 * REST API for product image management operations.
 * Requires admin authentication.
 *
 * POST /api/admin/products/images
 * Body: { productId, action, ...params }
 *
 * Actions:
 *   reorder   – { images: string[] }
 *   remove    – { imageUrl: string, deleteFromStorage?: boolean }
 *   set-main  – { imageUrl: string }
 *   add-url   – { imageUrl: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  reorderProductImages,
  removeProductImage,
  setMainProductImage,
  addProductImageUrl,
} from "@/app/actions/images";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON." }, { status: 400 });
  }

  const { productId, action } = body as {
    productId?: string;
    action?: string;
    [key: string]: unknown;
  };

  if (!productId) {
    return NextResponse.json({ error: "productId fehlt." }, { status: 400 });
  }
  if (!action) {
    return NextResponse.json({ error: "action fehlt." }, { status: 400 });
  }

  switch (action) {
    case "reorder": {
      const { images } = body as { images: string[] };
      if (!Array.isArray(images)) {
        return NextResponse.json({ error: "images muss ein Array sein." }, { status: 400 });
      }
      const result = await reorderProductImages(productId, images);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "remove": {
      const { imageUrl, deleteFromStorage } = body as {
        imageUrl: string;
        deleteFromStorage?: boolean;
      };
      if (!imageUrl) {
        return NextResponse.json({ error: "imageUrl fehlt." }, { status: 400 });
      }
      const result = await removeProductImage(productId, imageUrl, !!deleteFromStorage);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "set-main": {
      const { imageUrl } = body as { imageUrl: string };
      if (!imageUrl) {
        return NextResponse.json({ error: "imageUrl fehlt." }, { status: 400 });
      }
      const result = await setMainProductImage(productId, imageUrl);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    case "add-url": {
      const { imageUrl } = body as { imageUrl: string };
      if (!imageUrl) {
        return NextResponse.json({ error: "imageUrl fehlt." }, { status: 400 });
      }
      const result = await addProductImageUrl(productId, imageUrl);
      if (result.error) return NextResponse.json({ error: result.error }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: `Unbekannte action: ${action}` }, { status: 400 });
  }
}
