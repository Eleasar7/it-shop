# TechCore – IT-Hardware Webshop
## Vollständige Setup-Anleitung

---

## 1. Projekt erstellen

```bash
npx create-next-app@latest it-shop \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd it-shop
```

---

## 2. Abhängigkeiten installieren

```bash
# Core
npm install @prisma/client prisma
npm install @supabase/supabase-js @supabase/ssr
npm install stripe @stripe/stripe-js
npm install zustand
npm install zod
npm install lucide-react

# Typen
npm install -D @types/node
```

---

## 3. Supabase einrichten

1. Gehe zu [supabase.com](https://supabase.com) → Neues Projekt erstellen
2. Notiere dir:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`
   - **Database URL** (Settings → Database → Connection String) → `DATABASE_URL`

### Supabase Auth konfigurieren
- Authentication → Providers → Email: aktivieren
- Authentication → URL Configuration:
  - Site URL: `http://localhost:3000` (dev) / deine Domain (prod)
  - Redirect URLs: `http://localhost:3000/auth/callback`

---

## 4. Stripe einrichten

1. Gehe zu [dashboard.stripe.com](https://dashboard.stripe.com)
2. Notiere dir unter Developers → API Keys:
   - **Publishable Key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret Key** → `STRIPE_SECRET_KEY`
3. Webhook einrichten:
   - Developers → Webhooks → Add endpoint
   - URL: `https://deine-domain.de/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.expired`
   - Webhook Signing Secret → `STRIPE_WEBHOOK_SECRET`

### Lokaler Webhook-Test (Stripe CLI)
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 5. Umgebungsvariablen (.env.local)

```env
# Datenbank (Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 6. Prisma & Datenbank einrichten

```bash
# Schema in DB übertragen
npx prisma generate
npx prisma db push

# Oder mit Migrationen (für Produktion empfohlen)
npx prisma migrate dev --name init

# Seed-Daten einspielen
npx prisma db seed
```

**package.json** – Seed-Script hinzufügen:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts"
  }
}
```

---

## 7. Admin-User erstellen

1. App starten: `npm run dev`
2. Unter `/register` einen Account erstellen
3. In Supabase → Table Editor → `users` → Role auf `ADMIN` setzen

**Oder via SQL:**
```sql
UPDATE public.users 
SET role = 'ADMIN' 
WHERE email = 'dein@email.de';
```

---

## 8. Entwicklungsserver starten

```bash
npm run dev
# → http://localhost:3000
```

### Wichtige URLs:
| Pfad | Beschreibung |
|------|-------------|
| `/` | Startseite |
| `/products` | Produktliste |
| `/login` | Login |
| `/register` | Registrierung |
| `/account` | Kundenkonto |
| `/admin` | Admin-Dashboard (nur Admin) |
| `/admin/products/new` | Produkt erstellen |
| `/admin/orders` | Bestellübersicht |
| `/b2b` | B2B-Anfrageformular |

---

## 9. Datei-Struktur übernehmen

Kopiere alle generierten Dateien in dein Projekt:

```bash
# Aus dem Output-Ordner
cp schema.prisma ./prisma/schema.prisma
cp middleware.ts ./middleware.ts
cp -r app/ ./app/
cp -r components/ ./components/
cp -r lib/ ./lib/
cp -r store/ ./store/
cp -r types/ ./types/
cp tailwind.config.ts ./tailwind.config.ts
```

---

## 10. Produktionsdeployment (Vercel)

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel

# Umgebungsvariablen in Vercel setzen:
# Dashboard → Project → Settings → Environment Variables
# Alle .env.local Variablen dort eintragen
```

**Wichtig für Produktion:**
- `DATABASE_URL` mit Pooler-URL (Port 6543) für Serverless
- `DIRECT_URL` mit direkter Verbindung (Port 5432) für Migrationen
- Stripe Webhook-URL auf Produktionsdomain aktualisieren
- In `middleware.ts` und `app/(admin)/layout.tsx` Rollenprüfung aktiv lassen

---

## 11. Produktbilder (empfohlen)

Nutze **Supabase Storage** für Produktbilder:
1. Supabase → Storage → Neuer Bucket: `products` (public)
2. In der Admin-Oberfläche Bilder hochladen
3. URL-Format: `https://[ref].supabase.co/storage/v1/object/public/products/bild.jpg`

Oder **Cloudinary** für automatische Bildoptimierung.

---

## Architektur-Sicherheitsprinzipien

✅ Preise immer aus DB – nie vom Client  
✅ Auth in Middleware + Server Components  
✅ Admin-Rollen serverseitig geprüft  
✅ Stripe Webhook mit Signatur-Verifikation  
✅ Zod-Validierung auf allen API-Routen  
✅ Stripe Session-ID als Idempotenz-Schlüssel  
✅ Lagerbestand bei Bestellung aktuell  
✅ Umgebungsvariablen nie im Frontend  
