// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },     // Supabase Storage
      { protocol: "https", hostname: "res.cloudinary.com" }, // optional
      { protocol: "https", hostname: "cdn.shopify.com" },    // optional
      // Allow all https in development (remove in strict prod if desired)
      { protocol: "https", hostname: "**" },
    ],
  },
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
