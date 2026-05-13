// lib/email.ts
// Email sending infrastructure.
// Uses Resend (https://resend.com) as the provider — or any SMTP via nodemailer.
// Set RESEND_API_KEY in your environment to enable real sends.
// If the key is absent, emails are logged to the console (dev mode).

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; unitPrice: number; totalPrice: number }>;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  createdAt: Date;
}

interface B2BEmailData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  message: string;
  items?: Array<{ productName: string; quantity: number }>;
}

// ─── Send function ───────────────────────────────────────────────────────────

const FROM_EMAIL = process.env.EMAIL_FROM ?? "noreply@techcore-shop.de";
const ADMIN_EMAIL = process.env.EMAIL_ADMIN ?? "admin@techcore-shop.de";

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  // Dev mode: log to console instead of sending
  if (!apiKey || apiKey === "re_XXXX") {
    console.log("[EMAIL - DEV MODE]", {
      to: payload.to,
      subject: payload.subject,
      preview: payload.html.slice(0, 200),
    });
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        ...(payload.replyTo && { reply_to: payload.replyTo }),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Email] Send failed:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] Network error:", err);
    return false;
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #08091a; color: #f8fafc; max-width: 600px; margin: 0 auto;
  padding: 0;
`;

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:16px;background:#030508;">
<table width="100%" cellpadding="0" cellspacing="0" style="${baseStyle}border-radius:12px;overflow:hidden;">
  <tr>
    <td style="background:linear-gradient(135deg,#111328,#0c0e1e);padding:32px;border-bottom:1px solid rgba(255,255,255,0.07);">
      <p style="margin:0;font-size:22px;font-weight:900;color:#f8fafc;letter-spacing:-0.5px;">
        TechCore<span style="color:#818cf8;">.</span>
      </p>
      <p style="margin:4px 0 0;font-size:11px;color:#475569;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Premium IT-Hardware</p>
    </td>
  </tr>
  <tr>
    <td style="padding:32px;">
      ${content}
    </td>
  </tr>
  <tr>
    <td style="padding:24px 32px;background:#060912;border-top:1px solid rgba(255,255,255,0.05);">
      <p style="margin:0;font-size:12px;color:#334155;text-align:center;">
        TechCore GmbH · Königstraße 1 · 70173 Stuttgart<br>
        <a href="https://techcore-shop.de" style="color:#4f46e5;text-decoration:none;">techcore-shop.de</a>
      </p>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function formatEur(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
}

// ─── Public functions ─────────────────────────────────────────────────────────

/**
 * Order confirmation to the customer.
 */
export async function sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
  const itemRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#cbd5e1;font-size:14px;">${item.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#94a3b8;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);color:#e2e8f0;font-size:14px;text-align:right;font-weight:600;">${formatEur(item.totalPrice)}</td>
    </tr>`
    )
    .join("");

  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#f8fafc;">Bestellbestätigung 🎉</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hallo ${data.customerName}, vielen Dank für deine Bestellung!</p>
    
    <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#818cf8;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Bestellnummer</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:900;color:#f8fafc;font-family:monospace;">#${data.orderNumber.slice(-8).toUpperCase()}</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <th style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-align:left;">Produkt</th>
        <th style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-align:center;">Menge</th>
        <th style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-align:right;">Preis</th>
      </tr>
      ${itemRows}
      <tr>
        <td colspan="2" style="padding:12px 0 0;color:#94a3b8;font-size:13px;">Versand</td>
        <td style="padding:12px 0 0;color:#f8fafc;font-size:14px;text-align:right;font-weight:600;">${data.shippingCost === 0 ? "Kostenlos" : formatEur(data.shippingCost)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:8px 0 0;color:#f8fafc;font-size:16px;font-weight:900;">Gesamt</td>
        <td style="padding:8px 0 0;color:#f8fafc;font-size:18px;text-align:right;font-weight:900;">${formatEur(data.totalAmount)}</td>
      </tr>
    </table>

    <div style="text-align:center;margin-top:32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://techcore-shop.de"}/account/orders"
        style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
        Bestellung ansehen →
      </a>
    </div>
  `;

  return sendEmail({
    to: data.customerEmail,
    subject: `Bestellbestätigung #${data.orderNumber.slice(-8).toUpperCase()} – TechCore`,
    html: emailWrapper(content),
  });
}

/**
 * Admin notification when a new order comes in.
 */
export async function sendAdminOrderNotification(data: OrderEmailData): Promise<boolean> {
  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#f8fafc;">Neue Bestellung eingegangen</h1>
    <p style="margin:0 0 24px;color:#64748b;">Bestellnummer: <strong style="color:#818cf8;font-family:monospace;">#${data.orderNumber.slice(-8).toUpperCase()}</strong></p>
    
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">Kunde</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#f8fafc;">${data.customerName}</p>
      <p style="margin:0;font-size:13px;color:#64748b;">${data.customerEmail}</p>
    </div>

    <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">${data.items.length} Artikel · Gesamt: <strong style="color:#f8fafc;">${formatEur(data.totalAmount)}</strong></p>

    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://techcore-shop.de"}/admin/orders"
        style="display:inline-block;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#818cf8;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">
        Im Admin ansehen →
      </a>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `🛒 Neue Bestellung #${data.orderNumber.slice(-8).toUpperCase()} – ${formatEur(data.totalAmount)}`,
    html: emailWrapper(content),
  });
}

/**
 * B2B inquiry confirmation to the company.
 */
export async function sendB2BConfirmation(data: B2BEmailData): Promise<boolean> {
  const content = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#f8fafc;">Ihre Anfrage ist bei uns eingegangen</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;">
      Guten Tag ${data.contactName},<br><br>
      vielen Dank für Ihre B2B-Anfrage. Wir werden uns innerhalb von 24 Stunden bei Ihnen melden.
    </p>
    
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Ihre Angaben</p>
      <p style="margin:0 0 4px;color:#cbd5e1;font-size:14px;"><strong>Unternehmen:</strong> ${data.companyName}</p>
      <p style="margin:0 0 4px;color:#cbd5e1;font-size:14px;"><strong>Ansprechpartner:</strong> ${data.contactName}</p>
      ${data.phone ? `<p style="margin:0 0 4px;color:#cbd5e1;font-size:14px;"><strong>Telefon:</strong> ${data.phone}</p>` : ""}
    </div>

    <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
      Ihr Anliegen: <em style="color:#94a3b8;">${data.message}</em>
    </p>

    <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.15);border-radius:10px;padding:16px 20px;">
      <p style="margin:0;color:#818cf8;font-size:14px;">
        📞 Bei dringenden Anfragen erreichen Sie uns unter <strong>+49 711 123 4567</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: "Ihre B2B-Anfrage bei TechCore – Wir melden uns!",
    html: emailWrapper(content),
    replyTo: ADMIN_EMAIL,
  });
}

/**
 * Admin notification for new B2B inquiry.
 */
export async function sendB2BAdminNotification(data: B2BEmailData): Promise<boolean> {
  const content = `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#f8fafc;">Neue B2B-Anfrage</h1>
    
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 6px;color:#f8fafc;font-size:15px;font-weight:700;">${data.companyName}</p>
      <p style="margin:0 0 4px;color:#94a3b8;font-size:14px;">Kontakt: ${data.contactName}</p>
      <p style="margin:0 0 4px;color:#64748b;font-size:13px;">${data.email}${data.phone ? ` · ${data.phone}` : ""}</p>
    </div>

    <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Nachricht</p>
      <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.6;">${data.message}</p>
    </div>

    ${data.items && data.items.length > 0 ? `
    <div style="margin-bottom:20px;">
      <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Gewünschte Produkte</p>
      ${data.items.map((i) => `<p style="margin:0 0 4px;color:#cbd5e1;font-size:13px;">• ${i.productName} × ${i.quantity}</p>`).join("")}
    </div>` : ""}

    <div style="text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://techcore-shop.de"}/admin/b2b"
        style="display:inline-block;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);color:#818cf8;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:700;font-size:14px;">
        Anfrage bearbeiten →
      </a>
    </div>
  `;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: `📋 Neue B2B-Anfrage von ${data.companyName}`,
    html: emailWrapper(content),
    replyTo: data.email,
  });
}
