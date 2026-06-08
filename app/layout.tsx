// app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? siteConfig.siteUrl;

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${siteConfig.brandShort} – IT-Hardware Shop`,
    template: `%s | ${siteConfig.brandShort}`,
  },
  description:
    "IT-Hardware für Business & Projekte. " +
    "Schnelle Lieferung, geprüfte Qualität und persönlicher Support.",
  keywords: [
    "IT-Hardware", "iPhone kaufen", "MacBook", "Laptop", "B2B IT",
    "Webshop", "Limburgerhof", "Express-Versand",
  ],
  authors: [{ name: siteConfig.siteName, url: BASE_URL }],
  creator: siteConfig.siteName,
  publisher: siteConfig.siteName,

verification: {
  google: "Hm4uS_eNYOt1-ZfntKVizkz1JxOpibDqDBKkNFNGT2Q",
},

robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: BASE_URL,
    siteName: siteConfig.brandShort,
    title: `${siteConfig.brandShort} – IT-Hardware Shop`,
    description: "IT-Hardware für Business & Projekte.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.brandShort} – IT-Hardware Shop`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.brandShort} – IT-Hardware Shop`,
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-x-hidden`}
        style={{ background: "#f8f9fa", color: "#202124" }}
      >
        {children}
      </body>
    </html>
  );
}
