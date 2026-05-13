// app/api/products/route.ts
// GET /api/products – Produkte mit Filter, Suche und Paginierung

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productFilterSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = productFilterSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Filterparameter", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      inStock,
      sortBy,
      page,
      pageSize,
    } = parsed.data;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
      switch (sortBy) {
        case "price_asc":
          return { price: "asc" };
        case "price_desc":
          return { price: "desc" };
        case "name_asc":
          return { name: "asc" };
        default:
          return { createdAt: "desc" };
      }
    })();

    const skip = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          sku: true,
          description: true,
          specs: true,
          price: true,
          comparePrice: true,
          stock: true,
          lowStockAlert: true,
          images: true,
          isActive: true,
          isFeatured: true,
          tags: true,
          weight: true,
          categoryId: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const serialized = products.map((p) => ({
      ...p,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      data: serialized,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}