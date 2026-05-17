-- Migration: Add imageUrl to Category (if not already present)
-- Run with: npx prisma migrate dev --name add_category_image_url

ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
