// components/admin/StatusBadge.tsx
// Reusable status badge for orders, quotes, B2B, purchase orders.

interface BadgeConfig { label: string; className: string }

const ORDER_STATUS: Record<string, BadgeConfig> = {
  PENDING:    { label: "Ausstehend",     className: "badge-warning" },
  CONFIRMED:  { label: "Bestätigt",      className: "badge-info" },
  PROCESSING: { label: "In Bearbeitung", className: "badge-info" },
  SHIPPED:    { label: "Versendet",      className: "badge-info" },
  DELIVERED:  { label: "Geliefert",      className: "badge-success" },
  CANCELLED:  { label: "Storniert",      className: "badge-danger" },
  REFUNDED:   { label: "Erstattet",      className: "badge-neutral" },
};

const PAYMENT_STATUS: Record<string, BadgeConfig> = {
  PENDING:            { label: "Ausstehend",     className: "badge-warning" },
  PAID:               { label: "Bezahlt",        className: "badge-success" },
  FAILED:             { label: "Fehlgeschl.",    className: "badge-danger" },
  REFUNDED:           { label: "Erstattet",      className: "badge-neutral" },
  PARTIALLY_REFUNDED: { label: "Teil-Erstattet", className: "badge-warning" },
};

const QUOTE_STATUS: Record<string, BadgeConfig> = {
  DRAFT:    { label: "Entwurf",    className: "badge-neutral" },
  SENT:     { label: "Gesendet",   className: "badge-info" },
  ACCEPTED: { label: "Akzeptiert", className: "badge-success" },
  REJECTED: { label: "Abgelehnt",  className: "badge-danger" },
  EXPIRED:  { label: "Abgelaufen", className: "badge-warning" },
};

const B2B_STATUS: Record<string, BadgeConfig> = {
  OPEN:      { label: "Neu",           className: "badge-warning" },
  IN_REVIEW: { label: "In Prüfung",    className: "badge-info" },
  QUOTED:    { label: "Angebot sent.", className: "badge-info" },
  ACCEPTED:  { label: "Gewonnen",      className: "badge-success" },
  REJECTED:  { label: "Abgelehnt",     className: "badge-danger" },
  CLOSED:    { label: "Geschlossen",   className: "badge-neutral" },
};

const PO_STATUS: Record<string, BadgeConfig> = {
  DRAFT:     { label: "Entwurf",     className: "badge-neutral" },
  ORDERED:   { label: "Bestellt",    className: "badge-info" },
  PARTIAL:   { label: "Teillieferung", className: "badge-warning" },
  RECEIVED:  { label: "Erhalten",    className: "badge-success" },
  CANCELLED: { label: "Storniert",   className: "badge-danger" },
};

const STOCK_TYPE: Record<string, BadgeConfig> = {
  PURCHASE:   { label: "Eingang",       className: "badge-success" },
  SALE:       { label: "Verkauf",       className: "badge-info" },
  RETURN:     { label: "Rückgabe",      className: "badge-warning" },
  ADJUSTMENT: { label: "Korrektur",     className: "badge-neutral" },
  RESERVED:   { label: "Reserviert",    className: "badge-warning" },
  RELEASED:   { label: "Freigegeben",   className: "badge-neutral" },
};

type BadgeType = "order" | "payment" | "quote" | "b2b" | "po" | "stock";

const MAP: Record<BadgeType, Record<string, BadgeConfig>> = {
  order:   ORDER_STATUS,
  payment: PAYMENT_STATUS,
  quote:   QUOTE_STATUS,
  b2b:     B2B_STATUS,
  po:      PO_STATUS,
  stock:   STOCK_TYPE,
};

interface Props {
  type: BadgeType;
  value: string;
}

export function StatusBadge({ type, value }: Props) {
  const config = MAP[type]?.[value];
  if (!config) return <span className="badge badge-neutral">{value}</span>;
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}

// Export raw maps for use in server components or select options
export { ORDER_STATUS, PAYMENT_STATUS, QUOTE_STATUS, B2B_STATUS, PO_STATUS };
