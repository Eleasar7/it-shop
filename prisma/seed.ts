// prisma/seed.ts
// Run: npx prisma db seed

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Placeholder images from Unsplash — real product categories
const IMG = {
  laptop:    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
  macbook:   "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
  iphone:    "https://images.unsplash.com/photo-1678911820864-e5f61c3bbc6d?w=600&q=80",
  samsung:   "https://images.unsplash.com/photo-1707855206770-4be4b23c79e9?w=600&q=80",
  ipad:      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
  monitor:   "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
  server:    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  network:   "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80",
  ssd:       "https://images.unsplash.com/photo-1597138804456-e7dca7f59d54?w=600&q=80",
  ram:       "https://images.unsplash.com/photo-1562976540-1502c2145851?w=600&q=80",
  gpu:       "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80",
  cpu:       "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&q=80",
  printer:   "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80",
  nas:       "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  mainboard: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  accessory: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=80",
  software:  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80",
  workstation:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
};

async function main() {
  console.log("🌱 Seed-Daten werden erstellt...\n");

  // ═══════════════════════════════════════════
  // CATEGORIES (16)
  // ═══════════════════════════════════════════

  const catDefs = [
    { name: "Laptops",           slug: "laptops",      desc: "Business- und Consumer-Notebooks",          icon: "Laptop",    sort: 1  },
    { name: "Desktop PCs",       slug: "desktop-pcs",  desc: "Tower-PCs und Kompaktsysteme",              icon: "Monitor",   sort: 2  },
    { name: "Workstations",      slug: "workstations", desc: "High-Performance-Workstations",             icon: "Cpu",       sort: 3  },
    { name: "Server",            slug: "server",       desc: "Rack- und Tower-Server",                    icon: "Server",    sort: 4  },
    { name: "RAM",               slug: "ram",          desc: "DDR4 und DDR5 Arbeitsspeicher",             icon: "Memory",    sort: 5  },
    { name: "SSDs & Speicher",   slug: "ssds",         desc: "NVMe SSDs, SATA SSDs und HDDs",            icon: "HardDrive", sort: 6  },
    { name: "Grafikkarten",      slug: "grafikkarten", desc: "NVIDIA- und AMD-Grafikkarten",              icon: "Layers",    sort: 7  },
    { name: "Prozessoren",       slug: "prozessoren",  desc: "Intel- und AMD-Prozessoren",                icon: "Cpu",       sort: 8  },
    { name: "Mainboards",        slug: "mainboards",   desc: "ATX- und mITX-Mainboards",                 icon: "Circuit",   sort: 9  },
    { name: "Monitore",          slug: "monitore",     desc: "Business- und Gaming-Monitore",             icon: "Monitor",   sort: 10 },
    { name: "Netzwerk",          slug: "netzwerk",     desc: "Switches, Router und Access Points",        icon: "Network",   sort: 11 },
    { name: "NAS-Systeme",       slug: "nas",          desc: "Network Attached Storage",                  icon: "HardDrive", sort: 12 },
    { name: "Drucker",           slug: "drucker",      desc: "Laser- und Tintenstrahldrucker",            icon: "Printer",   sort: 13 },
    { name: "Smartphones",       slug: "smartphones",  desc: "iPhones und Android-Smartphones",           icon: "Smartphone",sort: 14 },
    { name: "Tablets",           slug: "tablets",      desc: "iPads und Android-Tablets",                 icon: "Tablet",    sort: 15 },
    { name: "Zubehör",           slug: "zubehoer",     desc: "Peripherie, Kabel, Adapter und Cases",      icon: "Package",   sort: 16 },
    { name: "Software",          slug: "software",     desc: "Betriebssysteme, Office und Sicherheit",    icon: "Code",      sort: 17 },
  ];

  console.log("📁 Kategorien anlegen...");
  const cats: Record<string, { id: string; name: string; slug: string }> = {};
  for (const c of catDefs) {
    const cat = await prisma.category.upsert({
      where:  { slug: c.slug },
      update: { name: c.name, description: c.desc, icon: c.icon, sortOrder: c.sort },
      create: { name: c.name, slug: c.slug, description: c.desc, icon: c.icon, sortOrder: c.sort },
    });
    cats[c.slug] = cat;
    console.log(`  ✓ ${c.name}`);
  }

  // ═══════════════════════════════════════════
  // PRODUCTS (100+)
  // ═══════════════════════════════════════════

  console.log("\n📦 Produkte anlegen...");

  type ProductInput = {
    name: string; brand: string; sku: string; description: string;
    specs: Record<string, string | number>; price: number; comparePrice?: number;
    stock: number; lowStockAlert?: number; images: string[]; categorySlug: string;
    isFeatured?: boolean; tags: string[];
    purchasePrice?: number; supplier?: string; supplierSku?: string; weight?: number;
  };

  const products: ProductInput[] = [

    // ─────────────────────────────────────────
    // LAPTOPS (14)
    // ─────────────────────────────────────────

    {
      name: "Lenovo ThinkPad T14 Gen 5 – Intel Core Ultra 7",
      brand: "Lenovo", sku: "LTP-T14G5-CU7-16",
      description: "Der ThinkPad T14 Gen 5 ist ein schlankes 14-Zoll-Business-Notebook mit Intel Core Ultra 7 Prozessor, 16 GB RAM und 512 GB NVMe SSD. Zertifiziert nach MIL-STD-810H für höchste Robustheit. Ideal für Unterwegs-Profis.",
      specs: { Prozessor: "Intel Core Ultra 7 165U", RAM: "16 GB LPDDR5x-6400", Speicher: "512 GB NVMe SSD", Display: "14 Zoll IPS, 1920x1200, 400 nits", Grafik: "Intel Graphics", Akku: "Bis zu 12 Stunden", Gewicht: "1,37 kg", Zertifizierung: "MIL-STD-810H", Betriebssystem: "Windows 11 Pro", Anschlüsse: "2x USB-C (TB4), 2x USB-A, HDMI 2.1, RJ-45" },
      price: 1249, comparePrice: 1449, stock: 34, lowStockAlert: 8,
      images: [IMG.laptop], categorySlug: "laptops", isFeatured: true,
      tags: ["thinkpad","lenovo","business","laptop","intel"], purchasePrice: 920, supplier: "Lenovo Deutschland GmbH", supplierSku: "21ML0052GE", weight: 1370,
    },
    {
      name: "Lenovo ThinkPad X1 Carbon Gen 12 – Core Ultra 7 256U",
      brand: "Lenovo", sku: "LTP-X1C12-256U",
      description: "Ultraleichtes Business-Notebook: Nur 1,09 kg bei 14 Zoll IPS-Display (2560x1600). Core Ultra 7 256U, 32 GB LPDDR5, 1 TB SSD. Das Flaggschiff für Vielreisende.",
      specs: { Prozessor: "Intel Core Ultra 7 256U", RAM: "32 GB LPDDR5x", Speicher: "1 TB NVMe SSD", Display: "14 Zoll IPS, 2560x1600, 400 nits, Touch-Option", Grafik: "Intel Graphics", Akku: "Bis zu 15 Stunden", Gewicht: "1,09 kg", Zertifizierung: "MIL-STD-810H, EPEAT Gold", Betriebssystem: "Windows 11 Pro" },
      price: 1899, stock: 11, lowStockAlert: 5,
      images: [IMG.laptop], categorySlug: "laptops", isFeatured: true,
      tags: ["thinkpad","lenovo","ultrabook","business"], purchasePrice: 1420, supplier: "Lenovo Deutschland GmbH", supplierSku: "21KGS00500", weight: 1090,
    },
    {
      name: "HP EliteBook 840 G11 – Core Ultra 5 125U",
      brand: "HP", sku: "HP-EB840G11-125U",
      description: "Der EliteBook 840 G11 bietet enterprise-grade Sicherheit (HP Wolf Security), 14-Zoll-WUXGA-Display und langen Akku. Ideal für IT-Abteilungen mit Volumenbestellungen.",
      specs: { Prozessor: "Intel Core Ultra 5 125U", RAM: "16 GB LPDDR5x", Speicher: "512 GB SSD M.2", Display: "14 Zoll WUXGA IPS, 1920x1200, 400 nits", Grafik: "Intel Graphics", Akku: "Bis zu 13 Stunden", Gewicht: "1,4 kg", Sicherheit: "HP Wolf Security, Fingerabdruckleser, Webcam-Schieber", Betriebssystem: "Windows 11 Pro" },
      price: 1189, comparePrice: 1349, stock: 27,
      images: [IMG.laptop], categorySlug: "laptops", isFeatured: false,
      tags: ["elitebook","hp","business","laptop"], purchasePrice: 870, supplier: "HP Deutschland GmbH", supplierSku: "9C0N1ET#ABD", weight: 1400,
    },
    {
      name: "HP EliteBook 860 G11 – Core Ultra 7 165U, 32 GB",
      brand: "HP", sku: "HP-EB860G11-165U-32",
      description: "16-Zoll-Powerhouse für anspruchsvolle Business-Anwender. WUXGA-Panel, 32 GB RAM, 1 TB SSD, HP Sure View Reflect Sichtschutz-Display.",
      specs: { Prozessor: "Intel Core Ultra 7 165U", RAM: "32 GB LPDDR5x", Speicher: "1 TB SSD M.2", Display: "16 Zoll WUXGA IPS, 1920x1200, Sure View Reflect", Grafik: "Intel Graphics", Akku: "Bis zu 12 Stunden", Gewicht: "1,85 kg", Betriebssystem: "Windows 11 Pro" },
      price: 1649, stock: 18,
      images: [IMG.laptop], categorySlug: "laptops",
      tags: ["elitebook","hp","business","16-zoll"], purchasePrice: 1220, supplier: "HP Deutschland GmbH", supplierSku: "9C0P4ET#ABD", weight: 1850,
    },
    {
      name: "Dell Latitude 5450 – Core Ultra 5 135U",
      brand: "Dell", sku: "DL-LAT5450-135U",
      description: "Dell Latitude 5450: Robustes Business-Notebook mit 14-Zoll-FHD+-Panel, Intel vPro-Unterstützung, langer Akkulaufzeit und umfangreichen Management-Features.",
      specs: { Prozessor: "Intel Core Ultra 5 135U", RAM: "16 GB DDR5", Speicher: "512 GB SSD", Display: "14 Zoll FHD+ (1920x1200), 300 nits", Grafik: "Intel Graphics", Akku: "Bis zu 13 Stunden", Gewicht: "1,41 kg", Betriebssystem: "Windows 11 Pro" },
      price: 1099, comparePrice: 1249, stock: 41,
      images: [IMG.laptop], categorySlug: "laptops", isFeatured: false,
      tags: ["latitude","dell","business","laptop"], purchasePrice: 800, supplier: "Dell Technologies Deutschland", supplierSku: "Latitude5450-002", weight: 1410,
    },
    {
      name: "Dell Latitude 7450 – Core Ultra 7 165U, 32 GB RAM",
      brand: "Dell", sku: "DL-LAT7450-165U-32",
      description: "Das Premium-Modell der Latitude-Reihe: Intel Core Ultra 7, 32 GB LPDDR5, 1 TB PCIe 4 SSD, 14 Zoll 2560x1600 IPS, Gewicht nur 1,18 kg.",
      specs: { Prozessor: "Intel Core Ultra 7 165U", RAM: "32 GB LPDDR5x-7467", Speicher: "1 TB SSD PCIe 4.0", Display: "14 Zoll 2560x1600, IPS, 500 nits", Grafik: "Intel Graphics", Akku: "Bis zu 14 Stunden", Gewicht: "1,18 kg", Betriebssystem: "Windows 11 Pro" },
      price: 1749, stock: 9, lowStockAlert: 5,
      images: [IMG.laptop], categorySlug: "laptops", isFeatured: true,
      tags: ["latitude","dell","ultrabook","premium"], purchasePrice: 1290, supplier: "Dell Technologies Deutschland", weight: 1180,
    },
    {
      name: "Apple MacBook Pro 14\" M4 Pro – 24 GB – Space Black",
      brand: "Apple", sku: "MBP14-M4P-24-SBK",
      description: "Das MacBook Pro 14 mit M4 Pro Chip (12-Core CPU, 20-Core GPU) und 24 GB Unified Memory. Liquid Retina XDR Display, bis zu 24 Stunden Akku, ProMotion 120 Hz.",
      specs: { Chip: "Apple M4 Pro (12-Core CPU, 20-Core GPU)", RAM: "24 GB Unified Memory", Speicher: "512 GB SSD", Display: "14,2 Zoll Liquid Retina XDR, 3024x1964, 120 Hz", Anschlüsse: "3x Thunderbolt 5, HDMI 2.1, SD-Card, MagSafe 3, Kopfhörer", Akku: "Bis zu 24 Stunden", Gewicht: "1,73 kg", Betriebssystem: "macOS Sequoia" },
      price: 2299, comparePrice: 2499, stock: 14, lowStockAlert: 5,
      images: [IMG.macbook], categorySlug: "laptops", isFeatured: true,
      tags: ["macbook","apple","m4","pro","laptop"], purchasePrice: 1750, supplier: "Apple Distribution International", supplierSku: "MX2Y3D/A", weight: 1730,
    },
    {
      name: "Apple MacBook Air 13\" M3 – 8 GB – Mitternacht",
      brand: "Apple", sku: "MBA13-M3-8-MID",
      description: "Das MacBook Air mit M3 Chip: Fanless Design, 18 Stunden Akku, 13,6 Zoll Liquid Retina Display. Perfekt für leichtes Business und Studium.",
      specs: { Chip: "Apple M3 (8-Core CPU, 10-Core GPU)", RAM: "8 GB Unified Memory", Speicher: "256 GB SSD", Display: "13,6 Zoll Liquid Retina, 2560x1664", Anschlüsse: "2x Thunderbolt 3, MagSafe 3, Kopfhörer", Akku: "Bis zu 18 Stunden", Gewicht: "1,24 kg", Betriebssystem: "macOS Sequoia", Besonderheit: "Fanless Design" },
      price: 1299, comparePrice: 1449, stock: 52,
      images: [IMG.macbook], categorySlug: "laptops", isFeatured: true,
      tags: ["macbook","apple","air","m3","laptop"], purchasePrice: 960, supplier: "Apple Distribution International", weight: 1240,
    },
    {
      name: "ASUS ProArt Studiobook 16 OLED – Core i9-13980HX",
      brand: "ASUS", sku: "ASUS-PSB16-I9-64",
      description: "Mobile Workstation für Kreative und 3D-Professionals: Intel Core i9-13980HX, 64 GB DDR5, NVIDIA RTX 4070, 16 Zoll 4K OLED-Display.",
      specs: { Prozessor: "Intel Core i9-13980HX (24-Core)", RAM: "64 GB DDR5-4800", Speicher: "2 TB NVMe SSD", Display: "16 Zoll 4K OLED, 3840x2400, 120 Hz", Grafik: "NVIDIA RTX 4070 8 GB", Akku: "90 Wh", Gewicht: "2,4 kg", Betriebssystem: "Windows 11 Pro" },
      price: 2899, stock: 5, lowStockAlert: 3,
      images: [IMG.laptop], categorySlug: "laptops",
      tags: ["asus","proart","workstation","laptop","oled"], purchasePrice: 2200, supplier: "ASUS Deutschland", weight: 2400,
    },
    {
      name: "MSI Stealth 16 AI Studio – Core Ultra 9 185H, RTX 4080",
      brand: "MSI", sku: "MSI-S16AI-U9-4080",
      description: "16 Zoll Gaming-Creator-Laptop: Intel Core Ultra 9 185H, NVIDIA GeForce RTX 4080 12 GB, 32 GB DDR5, QHD+ Mini LED Panel 240 Hz.",
      specs: { Prozessor: "Intel Core Ultra 9 185H", RAM: "32 GB DDR5-5600", Speicher: "2 TB NVMe PCIe 5.0", Display: "16 Zoll QHD+ Mini LED, 2560x1600, 240 Hz", Grafik: "NVIDIA RTX 4080 12 GB", Akku: "99,9 Wh", Gewicht: "2,15 kg", Betriebssystem: "Windows 11 Home" },
      price: 2499, comparePrice: 2799, stock: 7,
      images: [IMG.laptop], categorySlug: "laptops", isFeatured: false,
      tags: ["msi","gaming","laptop","rtx","creator"], purchasePrice: 1850, supplier: "MSI Computer GmbH", weight: 2150,
    },
    {
      name: "Acer TravelMate P4 14 – Core i5-1335U",
      brand: "Acer", sku: "ACER-TMP4-I5",
      description: "Schlankes 14-Zoll-Business-Notebook mit Intel Core i5-1335U, 16 GB RAM und 512 GB SSD. MIL-STD-810H-Zertifizierung für erhöhte Robustheit.",
      specs: { Prozessor: "Intel Core i5-1335U", RAM: "16 GB LPDDR5", Speicher: "512 GB SSD NVMe", Display: "14 Zoll IPS WUXGA, 1920x1200, 300 nits", Grafik: "Intel Iris Xe", Akku: "Bis zu 10 Stunden", Gewicht: "1,45 kg", Betriebssystem: "Windows 11 Pro" },
      price: 849, comparePrice: 999, stock: 63,
      images: [IMG.laptop], categorySlug: "laptops",
      tags: ["acer","travelmate","business","laptop"], purchasePrice: 620, supplier: "Acer Deutschland GmbH", weight: 1450,
    },
    {
      name: "Acer Swift 14 AI – Snapdragon X Elite",
      brand: "Acer", sku: "ACER-SF14-SQXE",
      description: "Copilot+ PC mit Qualcomm Snapdragon X Elite: 14 Zoll 2.8K OLED 120 Hz, 32 GB LPDDR5X, 1 TB SSD. Fanless Design, 27 Stunden Akku.",
      specs: { Prozessor: "Qualcomm Snapdragon X Elite X1E-78-100", RAM: "32 GB LPDDR5X", Speicher: "1 TB SSD", Display: "14 Zoll OLED 2880x1800, 120 Hz", Grafik: "Qualcomm Adreno", Akku: "Bis zu 27 Stunden", Gewicht: "1,35 kg", Betriebssystem: "Windows 11 Home (Copilot+)", Besonderheit: "Snapdragon X Elite, Fanless" },
      price: 1199, comparePrice: 1349, stock: 22,
      images: [IMG.laptop], categorySlug: "laptops",
      tags: ["acer","swift","copilot+","snapdragon","laptop"], purchasePrice: 880, supplier: "Acer Deutschland GmbH", weight: 1350,
    },
    {
      name: "HP ZBook Firefly G10 – Core i7-1355U, 32 GB",
      brand: "HP", sku: "HP-ZBF-G10-I7-32",
      description: "Leichte mobile Workstation: Intel Core i7-1355U, Intel Iris Xe Graphics, 32 GB DDR5, 1 TB SSD. Für Ingenieure und CAD-Anwender.",
      specs: { Prozessor: "Intel Core i7-1355U (10-Core)", RAM: "32 GB DDR5-4800", Speicher: "1 TB SSD PCIe 4.0", Display: "14 Zoll FHD IPS, 1920x1080, 400 nits", Grafik: "Intel Iris Xe Graphics", Akku: "Bis zu 13 Stunden", Gewicht: "1,37 kg", Betriebssystem: "Windows 11 Pro for Workstations" },
      price: 1549, stock: 13,
      images: [IMG.laptop], categorySlug: "laptops",
      tags: ["hp","zbook","workstation","laptop"], purchasePrice: 1140, supplier: "HP Deutschland GmbH", weight: 1370,
    },
    {
      name: "Dell XPS 15 9530 – Core i7-13700H, RTX 4060",
      brand: "Dell", sku: "DL-XPS15-I7-4060",
      description: "Premium Consumer-Notebook: 15,6 Zoll OLED-Display, Intel Core i7-13700H, NVIDIA RTX 4060, 32 GB DDR5, 1 TB NVMe SSD.",
      specs: { Prozessor: "Intel Core i7-13700H (14-Core)", RAM: "32 GB DDR5-4800", Speicher: "1 TB NVMe SSD", Display: "15,6 Zoll OLED 3456x2160, 60 Hz", Grafik: "NVIDIA RTX 4060 8 GB", Akku: "86 Wh", Gewicht: "1,86 kg", Betriebssystem: "Windows 11 Home" },
      price: 1899, comparePrice: 2199, stock: 8,
      images: [IMG.laptop], categorySlug: "laptops",
      tags: ["dell","xps","creator","laptop","oled"], purchasePrice: 1400, supplier: "Dell Technologies Deutschland", weight: 1860,
    },

    // ─────────────────────────────────────────
    // DESKTOP PCS (5)
    // ─────────────────────────────────────────

    {
      name: "HP EliteDesk 800 G9 Mini PC – Core i7-13700T",
      brand: "HP", sku: "HP-ED800G9-I7",
      description: "Kompakter Business-Desktop: Intel Core i7-13700T, 16 GB DDR5, 512 GB SSD in ultrakompaktem Mini-PC-Gehäuse. Inkl. Windows 11 Pro und 3 Jahre Vor-Ort-Garantie.",
      specs: { Prozessor: "Intel Core i7-13700T (16-Core)", RAM: "16 GB DDR5-4400", Speicher: "512 GB SSD M.2 NVMe", Grafik: "Intel UHD 770", Formfaktor: "Mini PC (17,7 x 17,5 x 3,4 cm)", Anschlüsse: "4x USB-A, 2x USB-C, HDMI, 2x DisplayPort, RJ-45", Betriebssystem: "Windows 11 Pro" },
      price: 999, comparePrice: 1149, stock: 31,
      images: [IMG.workstation], categorySlug: "desktop-pcs", isFeatured: true,
      tags: ["hp","elitedesk","mini-pc","desktop","business"], purchasePrice: 730, supplier: "HP Deutschland GmbH", weight: 1320,
    },
    {
      name: "Lenovo ThinkCentre M90q Tiny Gen 4 – Core i9-13900T",
      brand: "Lenovo", sku: "LEN-M90QG4-I9",
      description: "Ultra-kompakter Business-PC: Core i9-13900T, 32 GB DDR5, 1 TB SSD. Kleinstes Business-Desktop-Format mit enterprise-grade Verwaltbarkeit.",
      specs: { Prozessor: "Intel Core i9-13900T (24-Core)", RAM: "32 GB DDR5-4800", Speicher: "1 TB NVMe SSD PCIe 4.0", Grafik: "Intel UHD 770", Formfaktor: "Tiny (18,3 x 18,2 x 3,7 cm)", Betriebssystem: "Windows 11 Pro" },
      price: 1299, stock: 17,
      images: [IMG.workstation], categorySlug: "desktop-pcs",
      tags: ["lenovo","thinkcentre","tiny","desktop","business"], purchasePrice: 960, supplier: "Lenovo Deutschland GmbH", weight: 1800,
    },
    {
      name: "Dell OptiPlex 7020 SFF – Core i7-14700",
      brand: "Dell", sku: "DL-OP7020-I7-14",
      description: "Small Form Factor Business-Desktop mit Intel Core i7-14700 (20-Core), 32 GB DDR5-4400, 1 TB SSD. Dell ProManage-kompatibel.",
      specs: { Prozessor: "Intel Core i7-14700 (20-Core)", RAM: "32 GB DDR5-4400", Speicher: "1 TB NVMe SSD", Grafik: "Intel UHD 770", Formfaktor: "Small Form Factor", Betriebssystem: "Windows 11 Pro", Anschlüsse: "8x USB-A, 2x USB-C, HDMI, 2x DisplayPort, RJ-45" },
      price: 1179, comparePrice: 1349, stock: 22,
      images: [IMG.workstation], categorySlug: "desktop-pcs",
      tags: ["dell","optiplex","desktop","business"], purchasePrice: 870, supplier: "Dell Technologies Deutschland", weight: 6200,
    },
    {
      name: "Apple Mac Mini M4 Pro – 24 GB RAM",
      brand: "Apple", sku: "MCMINI-M4P-24",
      description: "Der kleinste und leistungsstärkste Mac Mini: M4 Pro Chip, 24 GB Unified Memory, 512 GB SSD, Thunderbolt 5, kompaktes Design.",
      specs: { Chip: "Apple M4 Pro (12-Core CPU, 20-Core GPU)", RAM: "24 GB Unified Memory", Speicher: "512 GB SSD", Anschlüsse: "2x Thunderbolt 5 (140 W), 3x USB-A, HDMI 2.1, Ethernet", Betriebssystem: "macOS Sequoia", Gewicht: "670 g", Abmessungen: "12,7 x 12,7 x 5 cm" },
      price: 1599, stock: 19,
      images: [IMG.workstation], categorySlug: "desktop-pcs", isFeatured: true,
      tags: ["apple","mac-mini","m4","desktop","macos"], purchasePrice: 1180, supplier: "Apple Distribution International", weight: 670,
    },
    {
      name: "ASUS NUC 14 Pro+ – Core Ultra 7 155H",
      brand: "ASUS", sku: "ASUS-NUC14-U7",
      description: "Mini-PC im 4x4-Formfaktor: Intel Core Ultra 7 155H, 32 GB LPDDR5X, 1 TB PCIe 4 SSD, Thunderbolt 4, Intel Arc Graphics.",
      specs: { Prozessor: "Intel Core Ultra 7 155H", RAM: "32 GB LPDDR5X-7467", Speicher: "1 TB NVMe SSD PCIe 4.0", Grafik: "Intel Arc Graphics", Formfaktor: "4x4 Mini PC", Anschlüsse: "2x Thunderbolt 4, 2x HDMI 2.1, 4x USB-A, RJ-45 2.5G" },
      price: 879, stock: 25,
      images: [IMG.workstation], categorySlug: "desktop-pcs",
      tags: ["asus","nuc","mini-pc","desktop"], purchasePrice: 640, supplier: "ASUS Deutschland", weight: 680,
    },

    // ─────────────────────────────────────────
    // WORKSTATIONS (3)
    // ─────────────────────────────────────────

    {
      name: "HP Z4 G5 Workstation Tower – Xeon W3-2423, 64 GB ECC",
      brand: "HP", sku: "HP-Z4G5-W3-64",
      description: "Tower-Workstation für CAD, Simulation und Content Creation: Intel Xeon W3-2423, 64 GB DDR5 ECC, 2 TB NVMe SSD, NVIDIA RTX A4000 16 GB.",
      specs: { Prozessor: "Intel Xeon W3-2423 (6-Core, 12-Thread)", RAM: "64 GB DDR5 ECC-RDIMM", Speicher: "2 TB NVMe SSD", Grafik: "NVIDIA RTX A4000 16 GB GDDR6", Betriebssystem: "Windows 11 Pro for Workstations", Formfaktor: "Tower", Garantie: "3 Jahre Vor-Ort-Nächster-Werktag" },
      price: 4299, stock: 4, lowStockAlert: 2,
      images: [IMG.workstation], categorySlug: "workstations", isFeatured: false,
      tags: ["hp","z4","workstation","xeon","cad"], purchasePrice: 3200, supplier: "HP Deutschland GmbH", weight: 18000,
    },
    {
      name: "Lenovo ThinkStation P5 – Xeon W5-2445, RTX 4000 Ada",
      brand: "Lenovo", sku: "LEN-P5-W5-4000ADA",
      description: "Professionelle Tower-Workstation für 3D-Rendering und KI-Workloads. Xeon W5-2445, 128 GB DDR5 ECC, NVIDIA RTX 4000 Ada Generation 20 GB.",
      specs: { Prozessor: "Intel Xeon W5-2445 (10-Core, 3,1 GHz)", RAM: "128 GB DDR5-4400 ECC RDIMM", Speicher: "2 TB SSD + 4 TB HDD", Grafik: "NVIDIA RTX 4000 Ada 20 GB GDDR6", Betriebssystem: "Windows 11 Pro for Workstations", "PCIe-Slots": "4x PCIe 5.0 x16", Formfaktor: "Tower" },
      price: 6499, stock: 2, lowStockAlert: 2,
      images: [IMG.workstation], categorySlug: "workstations",
      tags: ["lenovo","thinkstation","workstation","xeon","nvidia"], purchasePrice: 4800, supplier: "Lenovo Deutschland GmbH", weight: 22000,
    },
    {
      name: "Apple Mac Pro M2 Ultra – 192 GB Unified Memory",
      brand: "Apple", sku: "MACPRO-M2U-192",
      description: "Der mächtigste Mac aller Zeiten. M2 Ultra Chip mit 192 GB Unified Memory, 8 TB SSD, PCIe-Expansion für bis zu 6 Pro Display XDR.",
      specs: { Chip: "Apple M2 Ultra (24-Core CPU, 76-Core GPU)", RAM: "192 GB Unified Memory", Speicher: "8 TB SSD", Anschlüsse: "6x Thunderbolt 4, 2x USB-C, 2x USB-A, HDMI 2.1, 2x 10G Ethernet", Betriebssystem: "macOS Ventura", Besonderheit: "PCIe-Erweiterung für bis zu 6 Pro Display XDR" },
      price: 8999, stock: 1, lowStockAlert: 1,
      images: [IMG.workstation], categorySlug: "workstations", isFeatured: false,
      tags: ["apple","mac-pro","m2","workstation","creative"], purchasePrice: 6800, supplier: "Apple Distribution International", weight: 18100,
    },

    // ─────────────────────────────────────────
    // SERVER (4)
    // ─────────────────────────────────────────

    {
      name: "Dell PowerEdge R760 – 2x Xeon Gold 6430, 256 GB RAM",
      brand: "Dell", sku: "DL-PE-R760-6430",
      description: "2HE Rack-Server der neuesten Generation: 2x Intel Xeon Gold 6430, 256 GB DDR5 ECC, 8x 960 GB SSD (RAID-6), Dual-Port 25GbE. iDRAC9 Enterprise inklusive.",
      specs: { Prozessor: "2x Intel Xeon Gold 6430 (32-Core, 2,1 GHz)", RAM: "256 GB DDR5-4400 ECC RDIMM (8x 32 GB)", Speicher: "8x 960 GB SSD SATA (RAID6 = ~5,4 TB nutzbar)", Formfaktor: "2HE Rack", Netzwerk: "Dual-Port 25GbE + IPMI", Management: "iDRAC9 Enterprise", Netzteil: "2x 1100 W Hot-Swap" },
      price: 12499, stock: 3,
      images: [IMG.server], categorySlug: "server", isFeatured: true,
      tags: ["dell","poweredge","server","rack","xeon"], purchasePrice: 9200, supplier: "Dell Technologies Deutschland", weight: 25000,
    },
    {
      name: "HP ProLiant DL380 Gen11 – Xeon Silver 4416+, 128 GB",
      brand: "HP", sku: "HP-DL380G11-4416",
      description: "2HE Server-Klassiker in der 11. Generation: Intel Xeon Silver 4416+, 128 GB DDR5 ECC, 8x SFF Hot-Swap Bays, iLO 6. Ideal für Virtualisierung.",
      specs: { Prozessor: "Intel Xeon Silver 4416+ (20-Core, 2,0 GHz)", RAM: "128 GB DDR5-4400 ECC RDIMM", Speicher: "8x SFF Hot-Swap Bays (2x 480 GB SSD eingebaut)", Formfaktor: "2HE Rack", Netzwerk: "HPE FlexibleLOM 1x 4-Port 1GbE + OCP", Management: "iLO 6 Standard", Netzteil: "2x 800 W Titanium Hot-Swap" },
      price: 9799, stock: 4,
      images: [IMG.server], categorySlug: "server",
      tags: ["hp","proliant","server","rack","virtualisierung"], purchasePrice: 7300, supplier: "HP Deutschland GmbH", weight: 22000,
    },
    {
      name: "Supermicro SuperServer 6029P-TR – Tower/Rack",
      brand: "Supermicro", sku: "SMC-6029P-TR",
      description: "Flexibler Tower/Rack-Server (4HE): 1x Intel Xeon Scalable 2nd Gen, 8x DDR4-RDIMM bis 1,5 TB, 12x LFF HDD-Bays. Für File-Server und Datenbanken.",
      specs: { Prozessor: "1x Intel Xeon Silver 4214R (12-Core, 2,4 GHz)", RAM: "64 GB DDR4-2933 ECC RDIMM (8x 8 GB)", Speicher: "2x 480 GB SATA SSD (OS) + 6x 8 TB SATA HDD", Formfaktor: "4HE Rack / Tower", "HDD-Bays": "12x LFF Hot-Swap", Netzwerk: "2x 1GbE onboard + IPMI", Netzteil: "2x 750 W Platinum" },
      price: 5499, stock: 2,
      images: [IMG.server], categorySlug: "server",
      tags: ["supermicro","server","rack","fileserver"], purchasePrice: 4100, supplier: "Supermicro Europe", weight: 28000,
    },
    {
      name: "HP ProLiant MicroServer Gen11 – Xeon E-2434",
      brand: "HP", sku: "HP-MS-G11-E2434",
      description: "Kleiner Tower-Server für KMU: Intel Xeon E-2434 (4-Core), 16 GB ECC, 4x LFF Bays für bis zu 64 TB. iLO 6 Standard inklusive.",
      specs: { Prozessor: "Intel Xeon E-2434 (4-Core, 3,4 GHz)", RAM: "16 GB DDR5-4400 ECC UDIMM", Speicher: "2x 480 GB SSD (OS) + 4x LFF Bays frei", Formfaktor: "Tower", "HDD-Bays": "4x LFF (nicht belegbar bis 16 TB)", Management: "iLO 6 Standard", Netzteil: "1x 180 W" },
      price: 1899, stock: 8,
      images: [IMG.server], categorySlug: "server",
      tags: ["hp","proliant","microserver","kmu"], purchasePrice: 1400, supplier: "HP Deutschland GmbH", weight: 7400,
    },

    // ─────────────────────────────────────────
    // RAM (5)
    // ─────────────────────────────────────────

    {
      name: "Samsung 32 GB DDR5-5600 DIMM – PC5-44800",
      brand: "Samsung", sku: "SAM-32G-DDR5-5600",
      description: "Original Samsung Desktop-RAM DDR5-5600 32 GB. Für Intel 12./13./14. Gen LGA1700 und AMD AM5 Plattformen. Hervorragende Kompatibilität.",
      specs: { Kapazität: "32 GB (1x 32 GB)", Typ: "DDR5-5600 (PC5-44800)", Formfaktor: "DIMM (288-Pin)", Latenz: "CL40-40-40-77", Spannung: "1,1 V", ECC: "Non-ECC", Profil: "JEDEC" },
      price: 89, comparePrice: 119, stock: 147,
      images: [IMG.ram], categorySlug: "ram",
      tags: ["ram","ddr5","samsung","desktop"], purchasePrice: 60, supplier: "Samsung Semiconductor Europe", weight: 45,
    },
    {
      name: "Kingston Fury Beast DDR5 64 GB Kit (2x 32 GB) – 6000 MHz",
      brand: "Kingston", sku: "KNG-FB-64-DDR5-6000",
      description: "High-Performance-Kit: 2x 32 GB DDR5-6000 CL36, Intel XMP 3.0, AMD EXPO. Großes Heatspreader-Design in Schwarz.",
      specs: { Kapazität: "64 GB (2x 32 GB)", Typ: "DDR5-6000 (PC5-48000)", Formfaktor: "DIMM", Latenz: "CL36-38-38", Spannung: "1,35 V", Profile: "Intel XMP 3.0 + AMD EXPO", Farbe: "Schwarz" },
      price: 159, comparePrice: 199, stock: 83,
      images: [IMG.ram], categorySlug: "ram", isFeatured: true,
      tags: ["ram","ddr5","kingston","fury","kit"], purchasePrice: 115, supplier: "Kingston Technology Europe", weight: 110,
    },
    {
      name: "Corsair Vengeance DDR5 32 GB (2x 16 GB) – 5200 MHz",
      brand: "Corsair", sku: "CORS-VNG-32-5200",
      description: "Corsair Vengeance DDR5-5200 Kit für Intel und AMD. CL38, XMP 3.0 Support, schwarzes Low-Profile Design.",
      specs: { Kapazität: "32 GB (2x 16 GB)", Typ: "DDR5-5200 (PC5-41600)", Formfaktor: "DIMM", Latenz: "CL38", Spannung: "1,25 V", Profile: "Intel XMP 3.0", Farbe: "Schwarz" },
      price: 79, stock: 204,
      images: [IMG.ram], categorySlug: "ram",
      tags: ["ram","ddr5","corsair","vengeance"], purchasePrice: 55, supplier: "Corsair Europe GmbH", weight: 95,
    },
    {
      name: "Samsung 16 GB DDR4-3200 DIMM – PC4-25600 (ECC)",
      brand: "Samsung", sku: "SAM-16G-DDR4-3200-ECC",
      description: "Server-RAM von Samsung: 16 GB DDR4-3200 ECC Registered DIMM für Xeon- und EPYC-Plattformen.",
      specs: { Kapazität: "16 GB (1x 16 GB)", Typ: "DDR4-3200 ECC RDIMM", Formfaktor: "RDIMM (288-Pin)", Latenz: "CL22-22-22-52", Spannung: "1,2 V", ECC: "ECC Registered" },
      price: 49, stock: 312, lowStockAlert: 20,
      images: [IMG.ram], categorySlug: "ram",
      tags: ["ram","ddr4","samsung","ecc","server"], purchasePrice: 32, supplier: "Samsung Semiconductor Europe", weight: 42,
    },
    {
      name: "Crucial Pro 96 GB Kit (2x 48 GB) DDR5-5600 – CUDIMM",
      brand: "Crucial", sku: "CRC-PRO-96-CUDIMM",
      description: "Hochkapazitäts-RAM mit neuer CUDIMM-Technologie: 2x 48 GB DDR5-5600 CL46. Kompatibel mit Intel Core Ultra 200 (Arrow Lake) und Core 13./14. Gen.",
      specs: { Kapazität: "96 GB (2x 48 GB)", Typ: "DDR5-5600 CUDIMM", Formfaktor: "CUDIMM (288-Pin)", Latenz: "CL46-45-45", Spannung: "1,1 V", Besonderheit: "CUDIMM (Clock Driver integriert)" },
      price: 239, comparePrice: 289, stock: 41,
      images: [IMG.ram], categorySlug: "ram",
      tags: ["ram","ddr5","crucial","cudimm","96gb"], purchasePrice: 175, supplier: "Micron Technology (Crucial)", weight: 120,
    },

    // ─────────────────────────────────────────
    // SSDs & SPEICHER (6)
    // ─────────────────────────────────────────

    {
      name: "Samsung 990 Pro NVMe SSD 2 TB – PCIe 4.0",
      brand: "Samsung", sku: "SAM-990PRO-2TB",
      description: "Flaggschiff-SSD für Desktop und PS5: 7.450 MB/s lesen, 6.900 MB/s schreiben, PCIe 4.0 x4, M.2 2280. Inkl. Heat Spreader.",
      specs: { Kapazität: "2 TB", Interface: "PCIe 4.0 x4 (NVMe 2.0)", Formfaktor: "M.2 2280", Lesen: "7.450 MB/s", Schreiben: "6.900 MB/s", "IOPS Lesen": "1.600.000", DRAM: "1 GB LPDDR4", Garantie: "5 Jahre oder 1.200 TBW" },
      price: 159, comparePrice: 199, stock: 278, lowStockAlert: 20,
      images: [IMG.ssd], categorySlug: "ssds", isFeatured: true,
      tags: ["ssd","nvme","samsung","990-pro","pcie4"], purchasePrice: 110, supplier: "Samsung Semiconductor Europe", supplierSku: "MZ-V9P2T0BW", weight: 8,
    },
    {
      name: "Samsung 990 Evo NVMe SSD 1 TB – PCIe 5.0 x2 / PCIe 4.0 x4",
      brand: "Samsung", sku: "SAM-990EVO-1TB",
      description: "Die neue Evo-Generation unterstützt PCIe 5.0 x2 und PCIe 4.0 x4. 5.000 MB/s lesen, 4.200 MB/s schreiben. Breite Kompatibilität.",
      specs: { Kapazität: "1 TB", Interface: "PCIe 5.0 x2 / PCIe 4.0 x4", Formfaktor: "M.2 2280", Lesen: "5.000 MB/s", Schreiben: "4.200 MB/s", Garantie: "5 Jahre oder 600 TBW" },
      price: 79, comparePrice: 99, stock: 445,
      images: [IMG.ssd], categorySlug: "ssds",
      tags: ["ssd","nvme","samsung","990-evo"], purchasePrice: 54, supplier: "Samsung Semiconductor Europe", weight: 7,
    },
    {
      name: "WD Black SN850X NVMe SSD 4 TB – PCIe 4.0",
      brand: "WD", sku: "WD-SN850X-4TB",
      description: "Maximale Kapazität in der Black-Serie: 4 TB, PCIe 4.0 x4, 7.300 MB/s lesen. Ideal für Content-Creator-Systeme und Gaming-PCs.",
      specs: { Kapazität: "4 TB", Interface: "PCIe 4.0 x4 (NVMe)", Formfaktor: "M.2 2280", Lesen: "7.300 MB/s", Schreiben: "7.100 MB/s", Garantie: "5 Jahre oder 2.400 TBW" },
      price: 299, comparePrice: 369, stock: 67,
      images: [IMG.ssd], categorySlug: "ssds",
      tags: ["ssd","nvme","wd","black","pcie4"], purchasePrice: 215, supplier: "Western Digital Europe", weight: 9,
    },
    {
      name: "Seagate IronWolf Pro 12 TB NAS HDD – 7200 rpm",
      brand: "Seagate", sku: "SEA-IFP-12TB",
      description: "NAS-optimierte Festplatte für 24/7-Betrieb: 12 TB, 7.200 rpm, 256 MB Cache, Rescue Data Recovery Service (3 Jahre). Für RAID-Systeme.",
      specs: { Kapazität: "12 TB", Drehzahl: "7.200 rpm", Cache: "256 MB", Interface: "SATA 6 Gbps", Formfaktor: "3,5 Zoll", Garantie: "5 Jahre", Betrieb: "24/7", Besonderheit: "IronWolf Health Management" },
      price: 299, stock: 89,
      images: [IMG.ssd], categorySlug: "ssds",
      tags: ["hdd","nas","seagate","ironwolf","12tb"], purchasePrice: 215, supplier: "Seagate Europe", weight: 610,
    },
    {
      name: "Crucial MX500 2 TB SATA SSD – 2,5 Zoll",
      brand: "Crucial", sku: "CRC-MX500-2TB",
      description: "Zuverlässige SATA-SSD für Laptop-Upgrades und Desktop-Systeme: 2 TB, 560 MB/s lesen, 510 MB/s schreiben, 5-Jahre-Garantie.",
      specs: { Kapazität: "2 TB", Interface: "SATA III (6 Gbps)", Formfaktor: "2,5 Zoll (7 mm)", Lesen: "560 MB/s", Schreiben: "510 MB/s", DRAM: "2 GB LPDDR4", Garantie: "5 Jahre oder 700 TBW" },
      price: 129, comparePrice: 159, stock: 193,
      images: [IMG.ssd], categorySlug: "ssds",
      tags: ["ssd","sata","crucial","mx500","2tb"], purchasePrice: 90, supplier: "Micron Technology (Crucial)", weight: 40,
    },
    {
      name: "Samsung 870 EVO 1 TB SATA SSD – 2,5 Zoll",
      brand: "Samsung", sku: "SAM-870EVO-1TB",
      description: "Meistverkaufte SATA-SSD: 1 TB, bis zu 560 MB/s lesen, Samsung MKX Controller und V-NAND. Ideal für Desktop- und NAS-Einsatz.",
      specs: { Kapazität: "1 TB", Interface: "SATA III (6 Gbps)", Formfaktor: "2,5 Zoll", Lesen: "560 MB/s", Schreiben: "530 MB/s", DRAM: "1 GB LPDDR4", Garantie: "5 Jahre oder 600 TBW" },
      price: 79, stock: 522, lowStockAlert: 30,
      images: [IMG.ssd], categorySlug: "ssds",
      tags: ["ssd","sata","samsung","870-evo"], purchasePrice: 54, supplier: "Samsung Semiconductor Europe", weight: 50,
    },

    // ─────────────────────────────────────────
    // GRAFIKKARTEN (5)
    // ─────────────────────────────────────────

    {
      name: "NVIDIA GeForce RTX 4070 Super – 12 GB GDDR6X (Founders Edition)",
      brand: "NVIDIA", sku: "NV-RTX4070S-FE",
      description: "Die beste Karte im 500-Euro-Segment: RTX 4070 Super mit 12 GB GDDR6X, DLSS 3.5 Frame Generation, 4K- und WQHD-Gaming ohne Kompromisse.",
      specs: { GPU: "NVIDIA AD104 (GeForce RTX 4070 Super)", VRAM: "12 GB GDDR6X", Shader: "7.168", Boost: "2.475 MHz", Interface: "PCIe 4.0 x16", TDP: "220 W", Anschlüsse: "3x DisplayPort 1.4a, 1x HDMI 2.1", Länge: "267 mm" },
      price: 599, comparePrice: 679, stock: 34,
      images: [IMG.gpu], categorySlug: "grafikkarten", isFeatured: true,
      tags: ["gpu","nvidia","rtx4070","gaming","dlss"], purchasePrice: 450, supplier: "NVIDIA Europe", supplierSku: "900-1G141-2544-000", weight: 780,
    },
    {
      name: "ASUS TUF Gaming RTX 4080 Super OC – 16 GB GDDR6X",
      brand: "ASUS", sku: "ASUS-TUF-4080S-OC",
      description: "ASUS TUF Gaming RTX 4080 Super mit 16 GB GDDR6X, Triple-Fan-Kühlung, OC-Edition mit boost bis 2.610 MHz. MIL-STD-810H zertifiziert.",
      specs: { GPU: "NVIDIA AD103 (RTX 4080 Super)", VRAM: "16 GB GDDR6X", Shader: "10.240", Boost: "2.610 MHz (OC Mode)", Interface: "PCIe 4.0 x16", TDP: "320 W", Anschlüsse: "3x DisplayPort 1.4a, 1x HDMI 2.1", Länge: "338 mm" },
      price: 1049, comparePrice: 1149, stock: 12,
      images: [IMG.gpu], categorySlug: "grafikkarten", isFeatured: true,
      tags: ["gpu","asus","rtx4080","gaming","oc"], purchasePrice: 790, supplier: "ASUS Deutschland", weight: 1850,
    },
    {
      name: "AMD Radeon RX 7800 XT – 16 GB GDDR6 (Sapphire Pulse)",
      brand: "AMD", sku: "AMD-RX7800XT-SAP",
      description: "AMDs WQHD-Champion: 16 GB GDDR6, sehr gute Performance in 2560x1440, leise und effizient. Sapphire Pulse mit Dual-Fan-Kühler.",
      specs: { GPU: "AMD Navi 32 (RX 7800 XT)", VRAM: "16 GB GDDR6", Shader: "3.840", Boost: "2.430 MHz", Interface: "PCIe 4.0 x16", TDP: "263 W", Anschlüsse: "1x HDMI 2.1, 3x DisplayPort 2.1", Länge: "308 mm" },
      price: 479, comparePrice: 549, stock: 21,
      images: [IMG.gpu], categorySlug: "grafikkarten",
      tags: ["gpu","amd","radeon","rx7800xt","gaming"], purchasePrice: 355, supplier: "Sapphire Technology Europe", weight: 1120,
    },
    {
      name: "NVIDIA RTX A4000 – 16 GB GDDR6 Workstation GPU",
      brand: "NVIDIA", sku: "NV-RTXA4000-16",
      description: "Professionelle Workstation-GPU: NVIDIA RTX A4000, 16 GB GDDR6 ECC, Single-Slot-Cooling, 4x DisplayPort 1.4a. Für CAD, Simulation, VDI.",
      specs: { GPU: "NVIDIA GA104 (RTX A4000)", VRAM: "16 GB GDDR6 ECC", Shader: "6.144", Interface: "PCIe 4.0 x16", TDP: "140 W", Anschlüsse: "4x DisplayPort 1.4a", Treiber: "NVIDIA Studio/Quadro Enterprise Driver", ECC: "Ja" },
      price: 1199, stock: 7,
      images: [IMG.gpu], categorySlug: "grafikkarten",
      tags: ["gpu","nvidia","workstation","a4000","cad"], purchasePrice: 890, supplier: "NVIDIA Professional Solutions", weight: 620,
    },
    {
      name: "MSI GeForce RTX 4060 Ti Gaming X Slim – 16 GB",
      brand: "MSI", sku: "MSI-RTX4060TI-16-GX",
      description: "RTX 4060 Ti mit 16 GB GDDR6: Schlankes Design, DLSS 3.5, sehr gute Performance für FHD und WQHD-Gaming. MSI Gaming X Boost-Kühler.",
      specs: { GPU: "NVIDIA AD106 (RTX 4060 Ti)", VRAM: "16 GB GDDR6", Shader: "4.352", Boost: "2.535 MHz", Interface: "PCIe 4.0 x8", TDP: "165 W", Anschlüsse: "3x DisplayPort 1.4a, 1x HDMI 2.1", Länge: "244 mm" },
      price: 459, comparePrice: 499, stock: 43,
      images: [IMG.gpu], categorySlug: "grafikkarten",
      tags: ["gpu","msi","rtx4060ti","gaming","slim"], purchasePrice: 340, supplier: "MSI Computer GmbH", weight: 890,
    },

    // ─────────────────────────────────────────
    // PROZESSOREN (4)
    // ─────────────────────────────────────────

    {
      name: "Intel Core i9-14900K – 24-Core Desktop-Prozessor",
      brand: "Intel", sku: "INT-I9-14900K",
      description: "Intels schnellster Consumer-Desktop-Prozessor: 24 Kerne (8P+16E), bis zu 6,0 GHz Boost, PCIe 5.0, DDR5 Support. Für extreme Gaming und Content-Creation.",
      specs: { Kerne: "24 (8 P-Core + 16 E-Core)", Threads: "32", Takt: "Bis zu 6,0 GHz (Boost)", Cache: "36 MB Intel Smart Cache", Socket: "LGA1700", Grafik: "Intel UHD Graphics 770", TDP: "125 W (253 W PL2)", PCIe: "PCIe 5.0 + PCIe 4.0" },
      price: 539, comparePrice: 589, stock: 61,
      images: [IMG.cpu], categorySlug: "prozessoren", isFeatured: true,
      tags: ["cpu","intel","i9","14900k","gaming"], purchasePrice: 400, supplier: "Intel Deutschland GmbH", weight: 68,
    },
    {
      name: "AMD Ryzen 9 7950X – 16-Core Prozessor AM5",
      brand: "AMD", sku: "AMD-R9-7950X",
      description: "AMDs Topmodell für AM5: 16 Kerne / 32 Threads, bis zu 5,7 GHz, 80 MB Cache, PCIe 5.0, DDR5. Der schnellste Consumer-Desktop-CPU für Multi-Core-Workloads.",
      specs: { Kerne: "16", Threads: "32", Takt: "Bis zu 5,7 GHz (Boost)", Cache: "80 MB (L2+L3)", Socket: "AM5", Architektur: "Zen 4 (5 nm)", TDP: "170 W", PCIe: "PCIe 5.0" },
      price: 479, comparePrice: 599, stock: 38,
      images: [IMG.cpu], categorySlug: "prozessoren",
      tags: ["cpu","amd","ryzen9","7950x","workstation"], purchasePrice: 355, supplier: "AMD Deutschland GmbH", weight: 68,
    },
    {
      name: "Intel Xeon W-2245 – 8-Core Workstation-CPU LGA2066",
      brand: "Intel", sku: "INT-XEON-W2245",
      description: "Workstation-CPU für HP Z4/Z6 und Dell Precision: Intel Xeon W-2245, 8 Kerne, 3,9 GHz Base, 4,7 GHz Turbo, 16,5 MB Cache, ECC-Support.",
      specs: { Kerne: "8", Threads: "16", Takt: "3,9 GHz (5,0 GHz Turbo)", Cache: "16,5 MB L3", Socket: "LGA2066", ECC: "Ja", TDP: "155 W", Technologie: "Intel Cascade Lake-W" },
      price: 699, stock: 9,
      images: [IMG.cpu], categorySlug: "prozessoren",
      tags: ["cpu","intel","xeon","workstation","ecc"], purchasePrice: 520, supplier: "Intel Deutschland GmbH", weight: 88,
    },
    {
      name: "AMD Ryzen 7 7800X3D – 8-Core Gaming-CPU mit 3D V-Cache",
      brand: "AMD", sku: "AMD-R7-7800X3D",
      description: "Der schnellste Gaming-Prozessor: 8 Kerne / 16 Threads, 96 MB 3D V-Cache, 5,0 GHz Boost. Unerreichte Gaming-Performance durch riesigen L3-Cache.",
      specs: { Kerne: "8", Threads: "16", Takt: "Bis zu 5,0 GHz (Boost)", Cache: "96 MB 3D V-Cache", Socket: "AM5", Architektur: "Zen 4 + 3D V-Cache", TDP: "120 W" },
      price: 379, comparePrice: 449, stock: 87,
      images: [IMG.cpu], categorySlug: "prozessoren", isFeatured: true,
      tags: ["cpu","amd","ryzen7","7800x3d","gaming","3d-cache"], purchasePrice: 280, supplier: "AMD Deutschland GmbH", weight: 68,
    },

    // ─────────────────────────────────────────
    // MAINBOARDS (3)
    // ─────────────────────────────────────────

    {
      name: "ASUS ROG Maximus Z790 Hero – DDR5, PCIe 5.0",
      brand: "ASUS", sku: "ASUS-ROG-Z790-HERO",
      description: "High-End ATX-Mainboard für LGA1700: Z790-Chipsatz, DDR5-7800+ OC Support, 4x M.2 PCIe 5.0, 20-Phasen-VRM, Thunderbolt 4, WiFi 6E.",
      specs: { Chipsatz: "Intel Z790", Socket: "LGA1700", Speicher: "4x DDR5-DIMM bis 192 GB, max. DDR5-7800+", M2: "4x M.2 (2x PCIe 5.0, 2x PCIe 4.0)", PCIe: "2x PCIe 5.0 x16, 1x PCIe 4.0 x16", Formfaktor: "ATX (305 x 244 mm)", Netzwerk: "2x Intel 2.5 GbE + WiFi 6E", Anschlüsse: "2x Thunderbolt 4, 12x USB" },
      price: 599, comparePrice: 699, stock: 16,
      images: [IMG.mainboard], categorySlug: "mainboards",
      tags: ["mainboard","asus","rog","z790","lga1700"], purchasePrice: 445, supplier: "ASUS Deutschland", weight: 1580,
    },
    {
      name: "MSI MAG X670E Tomahawk WiFi – AM5, DDR5",
      brand: "MSI", sku: "MSI-MAG-X670E-TOM",
      description: "Top Preis-Leistungs-Mainboard für AMD AM5: X670E Chipsatz, DDR5-6400+ OC, PCIe 5.0 x16 + M.2, WiFi 6E, 2.5 GbE. Für Ryzen 7000/9000.",
      specs: { Chipsatz: "AMD X670E", Socket: "AM5", Speicher: "4x DDR5-DIMM bis 128 GB, max. DDR5-6400+", M2: "3x M.2 (1x PCIe 5.0, 2x PCIe 4.0)", PCIe: "1x PCIe 5.0 x16, 1x PCIe 4.0 x16", Formfaktor: "ATX (305 x 244 mm)", Netzwerk: "2.5 GbE + WiFi 6E", Anschlüsse: "2x USB 3.2 Gen2x2, 8x USB-A/C" },
      price: 299, comparePrice: 349, stock: 34,
      images: [IMG.mainboard], categorySlug: "mainboards", isFeatured: true,
      tags: ["mainboard","msi","x670e","am5","wifi"], purchasePrice: 220, supplier: "MSI Computer GmbH", weight: 1290,
    },
    {
      name: "Supermicro X13SAE-F – Xeon W Server-Mainboard ATX",
      brand: "Supermicro", sku: "SMC-X13SAE-F",
      description: "Server-Mainboard für Intel Xeon W: ECC DDR5, IPMI/BMC, PCIe 5.0, 2x 10GbE onboard. Für professionelle Workstations und Micro-Server.",
      specs: { Chipsatz: "Intel W680", Socket: "LGA1700", Speicher: "4x DDR5 ECC UDIMM/RDIMM bis 256 GB", M2: "2x M.2 PCIe 5.0", PCIe: "3x PCIe 5.0 x16, 1x PCIe 4.0", Formfaktor: "ATX (305 x 244 mm)", Netzwerk: "2x Intel 10GbE + IPMI/BMC", ECC: "Ja" },
      price: 549, stock: 6,
      images: [IMG.mainboard], categorySlug: "mainboards",
      tags: ["mainboard","supermicro","xeon","ecc","server"], purchasePrice: 410, supplier: "Supermicro Europe", weight: 1680,
    },

    // ─────────────────────────────────────────
    // MONITORE (4)
    // ─────────────────────────────────────────

    {
      name: "Dell UltraSharp U2724D – 27 Zoll QHD IPS USB-C",
      brand: "Dell", sku: "DL-U2724D",
      description: "Business-Monitor der Spitzenklasse: 27 Zoll 2560x1440 IPS Black Panel, USB-C 90W PD, RJ-45 KVM, 100% sRGB, Delta-E <2. Perfekt für Business-Desks.",
      specs: { Display: "27 Zoll IPS Black", Auflösung: "2560x1440 (QHD)", Helligkeit: "400 nits", Kontrast: "2000:1 (IPS Black)", Anschlüsse: "USB-C 90W, HDMI 2.0, 2x DP 1.4, 4x USB-A, RJ-45", Farbraum: "100% sRGB, 98% DCI-P3", Garantie: "3 Jahre Advanced Exchange" },
      price: 699, comparePrice: 799, stock: 44,
      images: [IMG.monitor], categorySlug: "monitore", isFeatured: true,
      tags:["monitor","dell","ultrasharp","27-zoll","usb-c"], purchasePrice: 510, supplier: "Dell Technologies Deutschland", weight: 5800,
    },
    {
      name: "LG UltraWide 34WP65C-B – 34 Zoll Curved UWQHD VA",
      brand: "LG", sku: "LG-34WP65C-B",
      description: "Ultrawide Curved Monitor: 34 Zoll 3440x1440 VA, 100 Hz, HDR10, USB-C 65 W, AMD FreeSync Premium. Perfekt für Produktivität und kreatives Arbeiten.",
      specs: { Display: "34 Zoll VA Curved (1800R)", Auflösung: "3440x1440 (UWQHD)", Helligkeit: "300 nits", Hz: "100 Hz", Anschlüsse: "USB-C 65W, HDMI 2.0, DP 1.4, 2x USB-A", HDR: "HDR10", Farbraum: "99% sRGB" },
      price: 449, comparePrice: 549, stock: 31,
      images: [IMG.monitor], categorySlug: "monitore",
      tags: ["monitor","lg","ultrawide","curved","34-zoll"], purchasePrice: 330, supplier: "LG Electronics Germany", weight: 7200,
    },
    {
      name: "HP Z27u G3 – 27 Zoll 4K USB-C 140W Workstation-Monitor",
      brand: "HP", sku: "HP-Z27UG3",
      description: "Professioneller Workstation-Monitor: 27 Zoll 4K (3840x2160) IPS, USB-C 140 W, 99% sRGB, 98% DCI-P3, Höhenverstellung, VESA. Für HP ZBook und andere Workstations.",
      specs: { Display: "27 Zoll IPS", Auflösung: "3840x2160 (4K UHD)", Helligkeit: "400 nits", Anschlüsse: "USB-C 140W, 2x HDMI 2.0, DP 1.4, 4x USB-A, RJ-45", Farbraum: "99% sRGB, 98% DCI-P3", "Delta-E": "<2" },
      price: 799, stock: 18,
      images: [IMG.monitor], categorySlug: "monitore",
      tags: ["monitor","hp","4k","27-zoll","usb-c","workstation"], purchasePrice: 590, supplier: "HP Deutschland GmbH", weight: 7500,
    },
    {
      name: "Samsung Odyssey G7 32\" – 4K 144 Hz Curved Gaming Monitor",
      brand: "Samsung", sku: "SAM-ODY-G7-32",
      description: "4K Gaming-Monitor: 32 Zoll 3840x2160 IPS, 144 Hz, 1ms (GTG), HDMI 2.1 48 Gbps, G-Sync Compatible. Für PS5, Xbox Series X und PC-Gaming.",
      specs: { Display: "32 Zoll IPS", Auflösung: "3840x2160 (4K UHD)", Hz: "144 Hz (DisplayPort) / 120 Hz (HDMI 2.1)", Reaktionszeit: "1 ms (GTG)", Anschlüsse: "HDMI 2.1, 2x DisplayPort 1.4, USB Hub", HDR: "DisplayHDR 600", Farbraum: "95% DCI-P3" },
      price: 699, comparePrice: 849, stock: 23,
      images: [IMG.monitor], categorySlug: "monitore", isFeatured: false,
      tags: ["monitor","samsung","odyssey","4k","gaming","144hz"], purchasePrice: 515, supplier: "Samsung Electronics Germany", weight: 8200,
    },

    // ─────────────────────────────────────────
    // NETZWERK (5)
    // ─────────────────────────────────────────

    {
      name: "Ubiquiti UniFi Switch Pro 24 PoE – 24-Port L3",
      brand: "Ubiquiti", sku: "UBI-USW-PRO24-POE",
      description: "Managed Layer 3 Switch: 24x Gigabit PoE+ (600 W Budget), 4x 10G SFP+ Uplinks, 1,3 mm dickere Aluminium-Chassis. Für professionelle Unternehmens-Netzwerke.",
      specs: { Ports: "24x RJ-45 PoE+ (Gigabit) + 4x SFP+ 10G", PoE: "PoE+ 802.3at, 600 W Budget", Layer: "Layer 3 (Static Routing, OSPF)", Switching: "88 Gbps non-blocking", Management: "UniFi Network Application", Netzteil: "1x 750 W intern", Abmessungen: "1HE" },
      price: 899, comparePrice: 999, stock: 14,
      images: [IMG.network], categorySlug: "netzwerk", isFeatured: true,
      tags: ["switch","ubiquiti","unifi","poe","managed"], purchasePrice: 670, supplier: "Ubiquiti Europe", supplierSku: "USW-Pro-24-POE", weight: 4800,
    },
    {
      name: "Ubiquiti UniFi Access Point U7 Pro – WiFi 7 Tri-Band",
      brand: "Ubiquiti", sku: "UBI-U7-PRO",
      description: "WiFi 7 Access Point der nächsten Generation: Tri-Band (2.4 + 5 + 6 GHz), bis zu 9,3 Gbps Gesamtdurchsatz, 230 verbundene Geräte, PoE+ 802.3at.",
      specs: { WiFi: "WiFi 7 (802.11be)", Frequenzen: "2.4 GHz + 5 GHz + 6 GHz", Durchsatz: "688 Mbps (2.4G) + 2.882 Mbps (5G) + 5.765 Mbps (6G)", Anschluss: "1x RJ-45 2.5G (PoE+)", Versorgung: "PoE+ 802.3at (25 W)", Antennen: "4x4 MIMO" },
      price: 189, stock: 67,
      images: [IMG.network], categorySlug: "netzwerk",
      tags: ["wifi","ubiquiti","unifi","wifi7","access-point"], purchasePrice: 140, supplier: "Ubiquiti Europe", supplierSku: "U7-Pro", weight: 380,
    },
    {
      name: "Cisco Catalyst 9200L-48P-4X – 48-Port PoE+ Switch",
      brand: "Cisco", sku: "CISCO-C9200L-48P",
      description: "Enterprise-Grade Switch: 48x PoE+ Gigabit-Ports (370 W), 4x SFP+ 10G Uplinks, IOS-XE Software, Cisco DNA Center Management.",
      specs: { Ports: "48x Gigabit PoE+ + 4x SFP+ 10G", PoE: "PoE+ 802.3at, 370 W Budget", Software: "Cisco IOS XE", Layer: "Layer 2+", Switching: "176 Gbps", Management: "DNA Center, GUI, CLI, REST API" },
      price: 2899, stock: 6,
      images: [IMG.network], categorySlug: "netzwerk",
      tags: ["switch","cisco","catalyst","enterprise","poe"], purchasePrice: 2150, supplier: "Cisco Systems Germany", weight: 5800,
    },
    {
      name: "pfSense Netgate 6100 MAX Security Gateway – 10G",
      brand: "Netgate", sku: "NG-6100-MAX",
      description: "Professionelle Firewall-Appliance mit pfSense Plus: 2x Intel Core i7 Multi-Core, 8 GB RAM, 10G SFP+ Ports, 2x Intel 2.5GbE. Für mittelgroße Unternehmensnetze.",
      specs: { Prozessor: "Intel Atom C3758R (8-Core)", RAM: "8 GB DDR4 ECC", Speicher: "16 GB eMMC", Netzwerk: "4x Intel 2.5GbE, 2x SFP+ 10G", Software: "pfSense Plus", Netzteil: "80 W DC intern", Formfaktor: "1HE Rack / Desktop" },
      price: 1299, stock: 8,
      images: [IMG.network], categorySlug: "netzwerk",
      tags: ["firewall","pfsense","netgate","router","security"], purchasePrice: 960, supplier: "Netgate Europe", weight: 2900,
    },
    {
      name: "TP-Link TL-SG3452X JetStream – 48-Port + 4x SFP+",
      brand: "TP-Link", sku: "TPL-SG3452X",
      description: "Kostengünstiger Managed Switch für KMU: 48x Gigabit, 4x SFP+ 10G Uplinks, VLAN, QoS, IGMP Snooping, L2+ Features. Rackmountable 1HE.",
      specs: { Ports: "48x Gigabit + 4x SFP+ 10G", Layer: "Layer 2+", Management: "Web GUI, CLI (Telnet/SSH), SNMP", Switching: "136 Gbps", VLANs: "802.1Q (bis 4.094 VLANs)", Netzteil: "Intern", Formfaktor: "1HE" },
      price: 349, comparePrice: 419, stock: 37,
      images: [IMG.network], categorySlug: "netzwerk",
      tags: ["switch","tp-link","managed","sfp+","kmu"], purchasePrice: 255, supplier: "TP-Link Deutschland GmbH", weight: 3200,
    },

    // ─────────────────────────────────────────
    // NAS (4)
    // ─────────────────────────────────────────

    {
      name: "Synology DiskStation DS923+ – 4-Bay NAS",
      brand: "Synology", sku: "SYN-DS923PLUS",
      description: "Vielseitiges 4-Bay NAS für KMU: AMD Ryzen R1600, 4 GB ECC DDR4, 2x M.2 NVMe Cache-Slots, 2x 1GbE + 10GbE Option, DSM 7.2. Ideal für Backup und File-Sharing.",
      specs: { Prozessor: "AMD Ryzen R1600 Dual-Core 2,6 GHz", RAM: "4 GB DDR4 ECC (erweiterbar auf 32 GB)", Bays: "4x 3,5/2,5 Zoll HDD/SSD + 2x M.2 NVMe", Netzwerk: "2x 1GbE (10GbE optional)", USB: "3x USB 3.2 Gen 1", Software: "Synology DSM 7.2", "Max. Kapazität": "4x 20 TB = 80 TB Raw" },
      price: 549, comparePrice: 629, stock: 22,
      images: [IMG.nas], categorySlug: "nas", isFeatured: true,
      tags: ["nas","synology","4-bay","backup","fileserver"], purchasePrice: 410, supplier: "Synology Technology Germany", supplierSku: "DS923+", weight: 2200,
    },
    {
      name: "Synology RackStation RS1221RP+ – 8-Bay NAS 1HE",
      brand: "Synology", sku: "SYN-RS1221RP",
      description: "8-Bay Rack-NAS mit redundanten Netzteilen: AMD Ryzen V1500B, 8 GB ECC, 4x 1GbE, Hot-Swap Bays. Für professionelle Rechenzentren.",
      specs: { Prozessor: "AMD Ryzen V1500B Quad-Core", RAM: "8 GB DDR4 ECC (max. 32 GB)", Bays: "8x 3,5/2,5 Zoll Hot-Swap", Netzwerk: "4x 1GbE", Netzteil: "Redundant (600 W + 600 W)", Formfaktor: "1HE Rack", Software: "DSM 7.2" },
      price: 1499, stock: 7,
      images: [IMG.nas], categorySlug: "nas",
      tags: ["nas","synology","rack","redundant","8-bay"], purchasePrice: 1110, supplier: "Synology Technology Germany", weight: 8400,
    },
    {
      name: "QNAP TS-464 – 4-Bay NAS mit Intel N5095, 8 GB RAM",
      brand: "QNAP", sku: "QNP-TS-464-8G",
      description: "Leistungsstarkes 4-Bay NAS: Intel N5095 Quad-Core, 8 GB DDR4, 2x M.2 PCIe Gen3 NVMe Cache, 2x 2.5GbE, USB 3.2 Gen2.",
      specs: { Prozessor: "Intel Celeron N5095 (Quad-Core, 2,9 GHz)", RAM: "8 GB DDR4 (max. 16 GB)", Bays: "4x 3,5/2,5 Zoll + 2x M.2 NVMe", Netzwerk: "2x 2.5GbE", USB: "2x USB 3.2 Gen2 + 2x USB 3.2 Gen1", Software: "QNAP QTS 5" },
      price: 429, comparePrice: 489, stock: 29,
      images: [IMG.nas], categorySlug: "nas",
      tags: ["nas","qnap","4-bay","2.5gbe","nvme-cache"], purchasePrice: 315, supplier: "QNAP Systems Europe", weight: 2000,
    },
    {
      name: "Synology BeeDrive Hub BDS2T4 – 4 TB Desktop NAS",
      brand: "Synology", sku: "SYN-BDS2T4",
      description: "Einfacher Einstieg in die NAS-Welt: 4 TB integriert, USB 3.2 Gen2, keine Festplatteninstallation nötig. Perfekt für Heimanwender und Einzel-Backup.",
      specs: { Kapazität: "4 TB (intern, 2x 2 TB)", Interface: "USB 3.2 Gen2 (10 Gbps)", Software: "Synology BeeDrive App", RAID: "Kein RAID (JBOD-ähnlich)", Abmessungen: "Klein Desktop", Garantie: "3 Jahre" },
      price: 179, comparePrice: 219, stock: 53,
      images: [IMG.nas], categorySlug: "nas",
      tags: ["nas","synology","desktop","usb","backup"], purchasePrice: 130, supplier: "Synology Technology Germany", weight: 450,
    },

    // ─────────────────────────────────────────
    // DRUCKER (3)
    // ─────────────────────────────────────────

    {
      name: "HP LaserJet Pro 4002dne – S/W Laserdrucker",
      brand: "HP", sku: "HP-LJP4002DNE",
      description: "Schneller S/W-Business-Drucker: 40 Seiten/Minute, automatischer Duplex, Netzwerk + WiFi, HP Smart App. Für Büros bis 25 Nutzer.",
      specs: { Druckgeschwindigkeit: "40 Seiten/Min", Druckauflösung: "600 x 600 dpi", Speicher: "512 MB RAM", Papier: "250-Blatt-Fach + 100-Blatt Zusatz", Netzwerk: "Ethernet + WiFi 5 + USB", Duplex: "Automatisch", Drucktechnologie: "Laser S/W" },
      price: 289, comparePrice: 349, stock: 29,
      images: [IMG.printer], categorySlug: "drucker",
      tags: ["drucker","hp","laserjet","sw","business"], purchasePrice: 210, supplier: "HP Deutschland GmbH", weight: 7800,
    },
    {
      name: "HP Color LaserJet Enterprise M856dn – A3 Farbdrucker",
      brand: "HP", sku: "HP-CLJE-M856DN",
      description: "Enterprise A3-Farbdrucker: 56 Seiten/Minute (Farbe), 1 GB RAM, Netzwerk-Ethernet, 2x 550-Blatt-Schubladen, Duplex. Für Druckvolumen bis 300.000 Seiten/Monat.",
      specs: { Druckgeschwindigkeit: "56 Seiten/Min (Farbe/S/W)", Druckauflösung: "1200 x 1200 dpi", Speicher: "1 GB RAM", Papier: "2x 550 Blatt + 100-Blatt MFP", Netzwerk: "Ethernet + USB", Druckformat: "A3 und kleiner", Duplex: "Automatisch" },
      price: 1899, stock: 6,
      images: [IMG.printer], categorySlug: "drucker",
      tags: ["drucker","hp","color","laserjet","enterprise","a3"], purchasePrice: 1400, supplier: "HP Deutschland GmbH", weight: 47000,
    },
    {
      name: "Brother HL-L9430CDN – Farb-Laserdrucker Business",
      brand: "Brother", sku: "BRO-HLL9430CDN",
      description: "Schneller Business-Farbdrucker: 40 Seiten/Min, NFC, 500-Blatt-Magazin, Ethernet + WiFi, Zero-Touch Printing. Empfohlen für 25–50 Nutzer.",
      specs: { Druckgeschwindigkeit: "40 Seiten/Min (Farbe)", Druckauflösung: "1200 x 1200 dpi", Speicher: "512 MB", Papier: "500-Blatt-Magazin", Netzwerk: "Gigabit Ethernet + WiFi + NFC", Betriebssystem: "Windows, macOS, Linux", Duplex: "Automatisch" },
      price: 499, comparePrice: 579, stock: 17,
      images: [IMG.printer], categorySlug: "drucker",
      tags: ["drucker","brother","farbe","business","wifi"], purchasePrice: 365, supplier: "Brother Industries Germany", weight: 22300,
    },

    // ─────────────────────────────────────────
    // SMARTPHONES (4)
    // ─────────────────────────────────────────

    {
      name: "Apple iPhone 16 Pro 256 GB – Titan Schwarz",
      brand: "Apple", sku: "IP16P-256-BLK",
      description: "Das iPhone 16 Pro: A18 Pro Chip, Dynamic Island, 48 MP Ultra Wide, Camera Control, Action Button. Das Flaggschiff für Profis und Business.",
      specs: { Chip: "Apple A18 Pro", Display: "6,3 Zoll Super Retina XDR, ProMotion 120 Hz, 2622x1206", Speicher: "256 GB", Kamera: "48 MP Main + 48 MP Ultra Wide + 12 MP 5x Telephoto", Akku: "Bis zu 27 Std. Videonutzung", Anschluss: "USB-C (USB 3)", Betriebssystem: "iOS 18", Besonderheit: "Camera Control, Action Button" },
      price: 1199, comparePrice: 1329, stock: 78,
      images: [IMG.iphone], categorySlug: "smartphones", isFeatured: true,
      tags: ["iphone","apple","16-pro","smartphone"], purchasePrice: 890, supplier: "Apple Distribution International", supplierSku: "MYNQ3ZD/A", weight: 227,
    },
    {
      name: "Apple iPhone 15 128 GB – Midnight",
      brand: "Apple", sku: "IP15-128-MID",
      description: "iPhone 15 mit Dynamic Island, USB-C, 48 MP Kamera. Professionelle Leistung zu einem attraktiven Preis – ideal als Business-Gerät.",
      specs: { Chip: "Apple A16 Bionic", Display: "6,1 Zoll Super Retina XDR, 2556x1179", Speicher: "128 GB", Kamera: "48 MP Main + 12 MP Ultra Wide", Akku: "Bis zu 26 Std. Videonutzung", Anschluss: "USB-C", Betriebssystem: "iOS 17 (updatbar auf iOS 18)", Farbe: "Midnight" },
      price: 799, comparePrice: 949, stock: 122,
      images: [IMG.iphone], categorySlug: "smartphones", isFeatured: true,
      tags: ["iphone","apple","15","smartphone"], purchasePrice: 590, supplier: "Apple Distribution International", weight: 171,
    },
    {
      name: "Samsung Galaxy S24 Ultra 512 GB – Titanium Gray",
      brand: "Samsung", sku: "SGS24U-512-GRY",
      description: "Das ultimative Samsung Flaggschiff: S Pen integriert, 200 MP Kamera, Galaxy AI, Snapdragon 8 Gen 3, 12 GB RAM, 6,8 Zoll QHD+ Dynamic AMOLED.",
      specs: { Chip: "Snapdragon 8 Gen 3 for Galaxy", Display: "6,8 Zoll QHD+ Dynamic AMOLED 2X, 120 Hz", Speicher: "512 GB (UFS 4.0)", RAM: "12 GB LPDDR5X", Kamera: "200 MP + 12 MP + 10 MP + 50 MP", Akku: "5.000 mAh, 45W kabellos 15W", Betriebssystem: "Android 14 (One UI 6.1)" },
      price: 1249, stock: 43,
      images: [IMG.samsung], categorySlug: "smartphones", isFeatured: true,
      tags: ["samsung","galaxy","s24","ultra","android","s-pen"], purchasePrice: 930, supplier: "Samsung Electronics Germany", weight: 232,
    },
    {
      name: "Samsung Galaxy S24 FE 256 GB – Graphite",
      brand: "Samsung", sku: "SGS24FE-256-GRA",
      description: "Galaxy S24 Fan Edition: Exynos 2500, 6,7 Zoll AMOLED, 50 MP Triple-Kamera, 4.700 mAh, 7 Jahre Software-Updates. Preis-Leistungs-Sieger.",
      specs: { Chip: "Samsung Exynos 2500", Display: "6,7 Zoll Super AMOLED, 120 Hz", Speicher: "256 GB", RAM: "8 GB", Kamera: "50 MP + 10 MP + 12 MP", Akku: "4.700 mAh, 25W", Betriebssystem: "Android 14 (One UI 7)", Updates: "7 Jahre Android-Updates" },
      price: 599, comparePrice: 699, stock: 86,
      images: [IMG.samsung], categorySlug: "smartphones",
      tags: ["samsung","galaxy","s24-fe","android","fan-edition"], purchasePrice: 440, supplier: "Samsung Electronics Germany", weight: 213,
    },

    // ─────────────────────────────────────────
    // TABLETS (2)
    // ─────────────────────────────────────────

    {
      name: "Apple iPad Pro 13\" M4 WiFi 256 GB – Space Black",
      brand: "Apple", sku: "IPP13-M4-256-SBK",
      description: "Das dünnste Apple-Produkt aller Zeiten: iPad Pro 13 mit M4 Chip, Ultra Retina XDR OLED-Display, Landscape TrueDepth Camera, Thunderbolt 4.",
      specs: { Chip: "Apple M4 (9-Core CPU, 10-Core GPU)", Display: "13 Zoll Ultra Retina XDR OLED, 2064x2752, 120 Hz", Speicher: "256 GB", Kamera: "12 MP Hauptkamera + 12 MP Ultra Wide", Anschluss: "USB-C (Thunderbolt 4 / USB 4)", Dicke: "5,1 mm (dünnster iPad je)", Betriebssystem: "iPadOS 18", Gewicht: "579 g" },
      price: 1299, comparePrice: 1449, stock: 24,
      images: [IMG.ipad], categorySlug: "tablets", isFeatured: true,
      tags: ["ipad","apple","m4","tablet","oled","pro"], purchasePrice: 960, supplier: "Apple Distribution International", weight: 579,
    },
    {
      name: "Samsung Galaxy Tab S9 FE+ 128 GB WiFi – Grau",
      brand: "Samsung", sku: "SGT-S9FEP-128-GRY",
      description: "12,4 Zoll Samsung Galaxy Tab S9 FE+: Exynos 1380, 8 GB RAM, 128 GB, Samsung DeX, S Pen inklusive, IP68.",
      specs: { Chip: "Samsung Exynos 1380 (Octa-Core)", Display: "12,4 Zoll TFT LCD, 2560x1600, 90 Hz", Speicher: "128 GB (erweiterbar via microSD)", RAM: "8 GB", Kamera: "8 MP + 8 MP Frontkamera", Akku: "10.090 mAh", Besonderheit: "S Pen inklusive, DeX-Modus, IP68", Betriebssystem: "Android 14" },
      price: 549, comparePrice: 649, stock: 33,
      images: [IMG.ipad], categorySlug: "tablets",
      tags: ["tablet","samsung","galaxy","s9","s-pen","android"], purchasePrice: 400, supplier: "Samsung Electronics Germany", weight: 627,
    },

    // ─────────────────────────────────────────
    // ZUBEHÖR (6)
    // ─────────────────────────────────────────

    {
      name: "Logitech MX Keys S – Kabellose Business-Tastatur",
      brand: "Logitech", sku: "LOG-MXKEYS-S",
      description: "Premium-Tastatur für Windows und macOS: perfekter Tastenanschlag, Backlighting mit Auto-Adaptivität, Logi Bolt + Bluetooth, bis zu 10 Tage Akku.",
      specs: { Layout: "Deutsches QWERTZ", Verbindung: "Logi Bolt USB + Bluetooth (bis 3 Geräte)", Akku: "Bis zu 10 Tage mit Beleuchtung", Beleuchtung: "Backlight mit Tastenbeleuchtung (adaptiv)", Kompatibilität: "Windows, macOS, ChromeOS, Linux", Formfaktor: "Full-size, kabellos" },
      price: 119, comparePrice: 139, stock: 174,
      images: [IMG.accessory], categorySlug: "zubehoer", isFeatured: false,
      tags: ["tastatur","logitech","mx-keys","wireless","business"], purchasePrice: 85, supplier: "Logitech Europe S.A.", supplierSku: "920-011406", weight: 810,
    },
    {
      name: "Logitech MX Master 3S – Business-Maus Wireless",
      brand: "Logitech", sku: "LOG-MXMASTER3S",
      description: "Die Referenz unter den Business-Mäusen: 8K DPI Sensor, MagSpeed-Scrollrad, Logi Bolt + Bluetooth, 3-Geräte-Verbindung, 70 Tage Akku.",
      specs: { DPI: "200–8.000 DPI (8K Sensor)", Verbindung: "Logi Bolt USB + Bluetooth", Akku: "Bis zu 70 Tage", Scrollrad: "MagSpeed Elektromagnetisch", Tasten: "7 programmierbar", Kompatibilität: "Windows, macOS, ChromeOS, Linux", Farbe: "Graphite" },
      price: 99, comparePrice: 119, stock: 233,
      images: [IMG.accessory], categorySlug: "zubehoer", isFeatured: false,
      tags: ["maus","logitech","mx-master","wireless","business"], purchasePrice: 72, supplier: "Logitech Europe S.A.", supplierSku: "910-006559", weight: 141,
    },
    {
      name: "CalDigit TS4 Thunderbolt 4 Dock – 18 Anschlüsse",
      brand: "CalDigit", sku: "CALD-TS4-BLK",
      description: "Die umfangreichste TB4-Dockingstation: 18 Anschlüsse inkl. 2x Thunderbolt 4, 2x HDMI 2.0, 5x USB-A 3.2, USB-C PD 98W, SD 4.0, 3.5mm.",
      specs: { Thunderbolt: "2x Thunderbolt 4 (40 Gbps)", Display: "2x HDMI 2.0 (bis 4K 120 Hz) + DP via TB4", USB: "5x USB-A 3.2 Gen2, 1x USB-C Gen2", Laden: "98 W Power Delivery (Host)", "Speicher-Karten": "SD 4.0 (UHS-II), microSD", Audio: "3.5mm Kombi-In/Out" },
      price: 349, comparePrice: 399, stock: 28,
      images: [IMG.accessory], categorySlug: "zubehoer",
      tags: ["dock","thunderbolt4","caldigit","usb-hub","mac"], purchasePrice: 255, supplier: "CalDigit Inc.", weight: 595,
    },
    {
      name: "Apple USB-C auf Magsafe 3 Kabel 2m – Für MacBook",
      brand: "Apple", sku: "APPLE-UCMAGSAFE3-2M",
      description: "Offizielles Apple-Kabel: USB-C auf MagSafe 3 (2 m) für alle MagSafe-3-MacBooks (M2/M3/M4). Unterstützt bis zu 140 W Schnellladung.",
      specs: { Länge: "2 Meter", Anschlüsse: "USB-C auf MagSafe 3", Leistung: "Bis zu 140 W", Kompatibilität: "MacBook Pro 14\" M2/M3/M4, MacBook Pro 16\" M2/M3/M4, MacBook Air M2/M3", Material: "Geflochten" },
      price: 49, stock: 312, lowStockAlert: 20,
      images: [IMG.accessory], categorySlug: "zubehoer",
      tags: ["kabel","apple","magsafe","macbook","ladekabel"], purchasePrice: 33, supplier: "Apple Distribution International", weight: 55,
    },
    {
      name: "Jabra Evolve2 55 UC – Business-Headset Wireless",
      brand: "Jabra", sku: "JAB-EV2-55-UC",
      description: "Professionelles ANC-Business-Headset für MS Teams und UC: hybrides ANC, Link 380 USB-Dongle, 36 Stunden Akku, zertifiziert für MS Teams.",
      specs: { ANC: "Hybrides Active Noise Cancellation", Akku: "36 Stunden (ohne ANC)", Verbindung: "Jabra Link 380 USB-A + Bluetooth 5.0", Zertifizierung: "MS Teams, UC", Mikrofon: "6 Mikrofone (Call + 3 für ANC)", Impedanz: "32 Ohm" },
      price: 299, comparePrice: 349, stock: 41,
      images: [IMG.accessory], categorySlug: "zubehoer",
      tags: ["headset","jabra","wireless","anc","teams","business"], purchasePrice: 220, supplier: "GN Audio Germany", weight: 295,
    },
    {
      name: "Kensington SD4900P Thunderbolt 4 Dual-4K-Dock",
      brand: "Kensington", sku: "KEN-SD4900P",
      description: "Dual-4K-60Hz-Dockingstation via Thunderbolt 4: 2x 4K DP/HDMI, 65W PD, 6x USB-A, RJ-45 Gigabit, Kopfhöreranschluss. Für HP/Dell/Lenovo-Business-Laptops.",
      specs: { Thunderbolt: "1x Thunderbolt 4 In (Host) + 1x TB4 Out", Display: "2x 4K 60Hz (HDMI 2.0 + DP 1.4)", USB: "6x USB-A 3.2, 1x USB-C", Laden: "65 W Power Delivery", Netzwerk: "Gigabit Ethernet", Audio: "3.5mm Kopfhörer" },
      price: 199, comparePrice: 249, stock: 55,
      images: [IMG.accessory], categorySlug: "zubehoer",
      tags: ["dock","kensington","thunderbolt4","4k","business"], purchasePrice: 145, supplier: "Kensington Computer Products Europe", weight: 490,
    },

    // ─────────────────────────────────────────
    // SOFTWARE (3)
    // ─────────────────────────────────────────

    {
      name: "Microsoft 365 Business Standard – 1 Jahr, 1 Nutzer",
      brand: "Microsoft", sku: "MS365-BS-1Y-1U",
      description: "Microsoft 365 Business Standard: Word, Excel, PowerPoint, Outlook, Teams, SharePoint, OneDrive (1 TB). 5 PC/Mac + 5 Mobilgeräte. 1 Jahr ESD.",
      specs: { Laufzeit: "12 Monate", Nutzer: "1 Nutzer", Geräte: "5 PC/Mac + 5 Tablets + 5 Smartphones", Apps: "Word, Excel, PowerPoint, Outlook, Teams, SharePoint, OneDrive", "Cloud-Speicher": "1 TB OneDrive", Lieferform: "Downloadcode (ESD)", Support: "Microsoft Support inklusive" },
      price: 149, stock: 9999, lowStockAlert: 0,
      images: [IMG.software], categorySlug: "software", isFeatured: true,
      tags: ["microsoft","365","office","business","abo"], purchasePrice: 109, supplier: "Microsoft Deutschland GmbH", weight: 0,
    },
    {
      name: "Windows 11 Pro – OEM Key – Download",
      brand: "Microsoft", sku: "WIN11-PRO-OEM",
      description: "Windows 11 Pro OEM-Lizenz: Für Neuinstallationen auf selbstgebauten PCs und Integratorgeräten. Vollständige Pro-Funktionen inkl. BitLocker, Remote Desktop, Hyper-V.",
      specs: { Version: "Windows 11 Pro", Lizenztyp: "OEM (gebunden an Hardware)", Aktivierung: "Online (Microsoft Activation Server)", Architektur: "64-Bit", Sprache: "Multilingual (DEU enthalten)", Lieferform: "Produktschlüssel (ESD)" },
      price: 139, comparePrice: 179, stock: 9999, lowStockAlert: 0,
      images: [IMG.software], categorySlug: "software",
      tags: ["windows","microsoft","oem","betriebssystem","pro"], purchasePrice: 95, supplier: "Microsoft Deutschland GmbH", weight: 0,
    },
    {
      name: "ESET Endpoint Security – 5 Seats, 1 Jahr (B2B)",
      brand: "ESET", sku: "ESET-EPS-5S-1Y",
      description: "Enterprise-Endpoint-Schutz: ESET Endpoint Security für 5 Geräte (Windows/macOS/Linux), 1 Jahr. Zentrales Management via ESET PROTECT Console.",
      specs: { Laufzeit: "12 Monate", Seats: "5 Geräte", Plattformen: "Windows, macOS, Linux, Android", Funktionen: "Antivirus, Firewall, Web-Schutz, Gerätesteuerung", Management: "ESET PROTECT Cloud-Konsole", Lieferform: "Aktivierungskey (ESD)" },
      price: 149, stock: 9999, lowStockAlert: 0,
      images: [IMG.software], categorySlug: "software",
      tags: ["security","eset","antivirus","endpoint","business"], purchasePrice: 105, supplier: "ESET Deutschland GmbH", weight: 0,
    },
  ];

  // ─── Upsert all products ───────────────────────────────────────────────────

  let created = 0, updated = 0;

  for (const p of products) {
    const catId = cats[p.categorySlug]?.id;
    if (!catId) {
      console.warn(`  ⚠ Kategorie '${p.categorySlug}' nicht gefunden für: ${p.name}`);
      continue;
    }

    const productSlug = slug(p.name);
    const data = {
      name:          p.name,
      slug:          productSlug,
      brand:         p.brand,
      sku:           p.sku,
      description:   p.description,
      specs:         p.specs,
      price:         p.price,
      comparePrice:  p.comparePrice ?? null,
      stock:         p.stock,
      reservedStock: 0,
      lowStockAlert: p.lowStockAlert ?? 5,
      images:        p.images,
      isActive:      true,
      isFeatured:    p.isFeatured ?? false,
      tags:          p.tags,
      weight:        p.weight ?? null,
      purchasePrice: p.purchasePrice ?? null,
      supplier:      p.supplier ?? null,
      supplierSku:   p.supplierSku ?? null,
      categoryId:    catId,
    };

    await prisma.product.upsert({
      where:  { slug: productSlug },
      update: { ...data },
      create: data,
    });

    console.log(`  ✓ [${p.categorySlug.padEnd(16)}] ${p.name.slice(0, 65)}`);
    created++;
  }

  console.log(`\n✅ ${catDefs.length} Kategorien, ${created} Produkte angelegt/aktualisiert.`);
  console.log("\n📋 Nächste Schritte:");
  console.log("   1. Admin-User in Supabase Auth anlegen");
  console.log("   2. UPDATE users SET role = 'ADMIN' WHERE email = 'admin@deineshop.de';");
  console.log("   3. npx prisma studio → Daten prüfen");
}

main()
  .catch((e) => {
    console.error("❌ Seed-Fehler:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
