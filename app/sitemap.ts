// app/sitemap.ts

import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

import { siteConfig } from "@/lib/site-config";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? siteConfig.siteUrl;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,          lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/b2b`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/versand`,  lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/rueckgabe`,lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/impressum`,lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/datenschutz`,lastModified:now,changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/agb`,      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  // Dynamic product pages
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    productRoutes = products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB may not be available during build; return static only
  }

  // Dynamic category pages
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    });
    categoryRoutes = categories.map((c) => ({
      url: `${BASE_URL}/products?category=${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    }));
  } catch {}

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
