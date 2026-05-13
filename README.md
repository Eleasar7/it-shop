# TechCore – IT-Hardware Webshop

Ein vollständiger, produktionsreifer IT-Hardware-Webshop auf Basis von **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Prisma**, **Supabase** und **Stripe**.

---

## Features

### Public Shop
- **Startseite** – Hero, Kategorien, Featured-Produkte, B2B-Banner
- **Produktliste** – Serverseitiger Filter (Kategorie, Marke, Preis, Suche), Paginierung
- **Produktdetail** – Bildgalerie, Specs-Tabelle, Add-to-Cart, ähnliche Produkte
- **Warenkorb** – Slide-In Drawer + vollständige Seite, Mengensteuerung, persistiert im localStorage
- **Checkout** – Weiterleitung zu Stripe, serverseitige Preisvalidierung
- **Erfolgs-/Abbruchseite** – nach Stripe Checkout
- **Login / Registrierung** – Supabase Auth, Passwort-Stärke-Anzeige
- **Kundenkonto** – Bestellübersicht mit Status-Stepper, Profilinfo
- **B2B-Formular** – Firmenanfragen mit Produktliste

### Admin-Bereich (nur für Admins)
- **Dashboard** – Umsatz, Bestellungen, Kunden, Lagerbestand-Alerts
- **Produkte** – CRUD, Specs als Key-Value, Bilder, Kategorien
- **Bestellungen** – Übersicht + Detail, Status- und Zahlungsstatus-Update
- **Kunden** – Übersicht mit Bestellanzahl und Gesamtumsatz

### Technisch
- **Serverseitige Preisvalidierung** – Preise kommen immer aus der DB
- **Stripe Webhook** – Idempotent, Bestellung wird nach Zahlung in DB gespeichert
- **Middleware-Schutz** – `/account`, `/checkout`, `/admin` geschützt
- **Zod-Validierung** – Alle API-Eingaben validiert
- **Defense in Depth** – Rollenprüfung in Middleware UND Server-Komponenten
- **Lagerbestand-Dekrement** – Atomisch in DB-Transaktion beim Webhook

---

## Schnellstart

```bash
# 1. Projekt aufsetzen
bash install.sh

# 2. Dateien aus /outputs in das Projektverzeichnis kopieren

# 3. .env.local befüllen (Supabase + Stripe Keys)

# 4. Datenbank initialisieren
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Dev-Server starten
npm run dev
```

---

## Tech Stack

| Technologie | Zweck |
|-------------|-------|
| **Next.js 15** | Framework (App Router, Server Components) |
| **TypeScript** | Typsicherheit |
| **Tailwind CSS** | Styling (Dark UI) |
| **Prisma** | ORM + Datenbankzugriff |
| **PostgreSQL** | Datenbank (via Supabase) |
| **Supabase Auth** | Authentifizierung, Sessions |
| **Stripe** | Zahlungsabwicklung, Webhooks |
| **Zustand** | Client-seitiger Cart-State |
| **Zod** | Schema-Validierung |

---

## Umgebungsvariablen

| Variable | Beschreibung |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL Pooler-URL (Supabase) |
| `DIRECT_URL` | PostgreSQL Direkt-URL für Migrationen |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (privat!) |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (privat!) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key (public) |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret |
| `NEXT_PUBLIC_APP_URL` | Öffentliche App-URL |

---

## Admin einrichten

```sql
-- Nach erster Registrierung in Supabase SQL Editor ausführen:
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'dein@email.de';
```

---

## Sicherheitsprinzipien

| Prinzip | Implementierung |
|---------|----------------|
| Preise serverseitig | `/api/checkout` lädt Preise aus DB, nie vom Client |
| Auth in Middleware | `middleware.ts` prüft Session für alle geschützten Routen |
| Rollenprüfung | `requireAdmin()` in jedem Admin-Route-Handler |
| Webhook-Signatur | Stripe Webhook verifiziert Signatur mit `STRIPE_WEBHOOK_SECRET` |
| Idempotenz | Webhook prüft `stripeSessionId` auf Doppelverarbeitung |
| Input-Validierung | Zod validiert alle API-Eingaben |
| Lagerbestand | Dekrement in `$transaction` – atomar |
| Secrets | Alle privaten Keys nur im Backend (keine `NEXT_PUBLIC_` Präfixe) |

---

## Projektstruktur (Kurzübersicht)

```
it-shop/
├── app/
│   ├── (shop)/          # Öffentlicher Shop
│   ├── (admin)/         # Admin-Bereich (geschützt)
│   └── api/             # API Route Handlers
├── components/
│   ├── shop/            # Shop-Komponenten
│   └── admin/           # Admin-Komponenten
├── lib/                 # Utilities (Prisma, Auth, Stripe, Validierung)
├── store/               # Zustand Cart Store
├── hooks/               # Custom React Hooks
├── types/               # TypeScript Typen
└── prisma/              # Schema + Seed
```

---

## Deployment (Vercel)

```bash
# Vercel CLI
npm i -g vercel
vercel

# Wichtig: alle .env.local Variablen in Vercel Dashboard eintragen
# Stripe Webhook URL auf Produktionsdomain aktualisieren:
# https://deine-domain.de/api/webhooks/stripe
```

---

## Lizenz

Privat – nicht zur Weiterverteilung
