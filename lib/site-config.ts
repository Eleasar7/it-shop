// lib/site-config.ts
// ─── Central branding / contact config for Envetra ───────────────────────────
// Change values here once; they propagate everywhere.

export const siteConfig = {
  /** Brand name displayed in UI */
  siteName: "Envetra",
  /** Short all-caps variant for logo badges */
  brandShort: "ENVETRA",
  /** Canonical production URL (no trailing slash) */
  siteUrl: "https://www.envetra.de",
  /** Primary support email */
  supportEmail: "info@envetra.de",
  /** Return / retoure email — same inbox for now */
  retoureEmail: "info@envetra.de",
  /** B2B / sales phone */
  phone: "+49 176 57719796",
  /** Human-readable phone */
  phoneDisplay: "+49 176 57719796",
  /** Street address */
  address: {
    street: "Wielandstraße 51",
    city: "67117 Limburgerhof",
    country: "Deutschland",
  },
  /** Responsible person for § 55 RStV */
  responsible: "Eleasar Hadrossek, Wielandstraße 51, 67117 Limburgerhof",
  /** Business hours shown in header / footer */
  businessHours: "Mo–Fr 8–18 Uhr",
} as const;

export type SiteConfig = typeof siteConfig;
