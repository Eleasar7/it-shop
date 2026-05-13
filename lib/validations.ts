// lib/validations.ts
// Alle Zod-Schemas zur Eingabevalidierung (serverseitig UND clientseitig)

import { z } from "zod";

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(8, "Mindestens 8 Zeichen")
    .regex(/[A-Z]/, "Mindestens ein Großbuchstabe")
    .regex(/[0-9]/, "Mindestens eine Zahl"),
  name: z.string().min(2, "Mindestens 2 Zeichen").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort erforderlich"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ─────────────────────────────────────────────
// PRODUKT (Admin)
// ─────────────────────────────────────────────

export const productSchema = z.object({
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche"),
  brand: z.string().min(1).max(100),
  sku: z.string().max(100).optional(),
  description: z.string().min(10),
  specs: z.record(z.union([z.string(), z.number(), z.boolean()])),
  price: z.number().positive("Preis muss positiv sein"),
  comparePrice: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).min(1, "Mindestens ein Bild erforderlich"),
  categoryId: z.string().cuid(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

// ─────────────────────────────────────────────
// CHECKOUT
// ─────────────────────────────────────────────

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .min(1, "Warenkorb ist leer"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ─────────────────────────────────────────────
// B2B ANFRAGE
// ─────────────────────────────────────────────

export const b2bRequestSchema = z.object({
  companyName: z.string().min(2).max(255),
  contactName: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  message: z.string().min(20).max(2000),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        productName: z.string(),
        quantity: z.number().int().min(1),
        notes: z.string().optional(),
      })
    )
    .optional(),
});

export type B2BRequestInput = z.infer<typeof b2bRequestSchema>;

// ─────────────────────────────────────────────
// FILTER
// ─────────────────────────────────────────────

export const productFilterSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().max(100).optional(),
  inStock: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "name_asc", "newest"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(24),
});

export type ProductFilterInput = z.infer<typeof productFilterSchema>;
