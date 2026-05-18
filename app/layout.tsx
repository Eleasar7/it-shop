// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://techcore-shop.de";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ENVETRA – IT-Hardware Shop",
    template: "%s | ENVETRA",
  },
  description:
    "IT-Hardware für Business & Projekte. " +
    "Schnelle Lieferung, geprüfte Qualität und persönlicher Support.",
  keywords: [
    "IT-Hardware", "iPhone kaufen", "MacBook", "Laptop", "B2B IT",
    "Webshop", "Stuttgart", "Express-Versand",
  ],
  authors: [{ name: "TechCore GmbH", url: BASE_URL }],
  creator: "TechCore GmbH",
  publisher: "TechCore GmbH",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: BASE_URL,
    siteName: "ENVETRA",
    title: "ENVETRA – IT-Hardware Shop",
    description:
      "IT-Hardware für Business & Projekte.",
    images: [
      {
        url: "/og-image.png",      // Place a 1200×630 image in /public/og-image.png
        width: 1200,
        height: 630,
        alt: "ENVETRA – IT-Hardware Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ENVETRA – IT-Hardware Shop",
    description: "IT-Hardware für Business & Projekte.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ background: "#f8f9fa", color: "#202124" }}
      >
        {children}
      </body>
    </html>
  );
}
