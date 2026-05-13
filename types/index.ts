// types/index.ts

// ─── Product ─────────────────────────────────────────────────────────────────

export interface ProductSpecs {
  [key: string]: string | number | boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  sku?: string | null;
  description: string;
  specs: ProductSpecs;
  price: number;
  comparePrice?: number | null;
  stock: number;
  reservedStock?: number;
  lowStockAlert: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  weight?: number | null;
  categoryId: string;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
  sortOrder: number;
}

// ─── Cart ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  quantity: number;
  product: Pick<Product, "id" | "name" | "slug" | "price" | "images" | "stock" | "brand">;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING" | "CONFIRMED" | "PROCESSING"
  | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";

export type PaymentStatus =
  | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderTimeline {
  id: string;
  orderId: string;
  event: string;
  message: string;
  oldValue?: string | null;
  newValue?: string | null;
  createdBy?: string | null;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  customerName?: string | null;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string | null;
  stripePaymentId?: string | null;
  stripeCustomerId?: string | null;
  trackingNumber?: string | null;
  shippingProvider?: string | null;
  notes?: string | null;
  adminNotes?: string | null;
  quoteId?: string | null;
  items: OrderItem[];
  timeline?: OrderTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Quote ───────────────────────────────────────────────────────────────────

export type QuoteStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId?: string | null;
  productName: string;
  productSku?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  note?: string | null;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  userId?: string | null;
  customerEmail: string;
  customerName?: string | null;
  customerCompany?: string | null;
  customerVatId?: string | null;
  customerPhone?: string | null;
  b2bRequestId?: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string | null;
  adminNotes?: string | null;
  validUntil?: Date | null;
  accessToken: string;
  items: QuoteItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── User / CRM ──────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN";
export type UserB2BStatus = "NONE" | "PROSPECT" | "ACTIVE" | "INACTIVE";

export interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  company?: string | null;
  phone?: string | null;
  vatId?: string | null;
  b2bStatus?: UserB2BStatus;
  tags?: string[];
  internalNotes?: string | null;
  // createdAt is intentionally not returned by getCurrentUser() because
  // it is a Date object and cannot be passed to Client Components as a prop.
  // Pages that need it should query separately and serialize to ISO string.
  createdAt?: string | Date;
}

export interface CustomerNote {
  id: string;
  userId: string;
  content: string;
  authorId?: string | null;
  createdAt: Date;
}

// ─── Supplier / Procurement ──────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type PurchaseOrderStatus =
  "DRAFT" | "ORDERED" | "PARTIAL" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrderItem {
  id: string;
  productId?: string | null;
  productName: string;
  productSku?: string | null;
  unitCost: number;
  quantity: number;
  quantityReceived: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: PurchaseOrderStatus;
  subtotal: number;
  totalAmount: number;
  notes?: string | null;
  expectedAt?: Date | null;
  receivedAt?: Date | null;
  items: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Stock ───────────────────────────────────────────────────────────────────

export type StockMovementType =
  "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT" | "RESERVED" | "RELEASED";

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  balanceAfter: number;
  reference?: string | null;
  reason?: string | null;
  createdBy?: string | null;
  createdAt: Date;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "NEW_ORDER" | "LOW_STOCK" | "NEW_B2B"
  | "QUOTE_ACCEPTED" | "QUOTE_REJECTED" | "NEW_CUSTOMER" | "SYSTEM";

export interface Notification {
  id: string;
  userId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
