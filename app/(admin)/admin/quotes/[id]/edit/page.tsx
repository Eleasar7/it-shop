// app/(admin)/admin/quotes/[id]/edit/page.tsx

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuoteForm } from "@/components/admin/QuoteForm";
import { updateQuote } from "@/app/actions/quotes";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps { params: Promise<{ id: string }> }

export default async function EditQuotePage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [quote, products] = await Promise.all([
    prisma.quote.findUnique({ where: { id }, include: { items: true } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" },
      select: { id: true, name: true, sku: true, price: true, images: true, brand: true } }),
  ]);
  if (!quote) notFound();

  const productsSerialized = products.map((p) => ({ ...p, price: Number(p.price) }));

  async function updateAndRedirect(prev: any, fd: FormData) {
    "use server";
    const result = await updateQuote(id, prev, fd);
    if (result.success) redirect(`/admin/quotes/${id}`);
    return result;
  }

  return (
    <div className="space-y-6">
      <Link href={`/admin/quotes/${id}`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ChevronLeft size={15} /> Zurück zum Angebot
      </Link>
      <h1 className="text-2xl font-bold text-slate-100">Angebot bearbeiten</h1>
      <QuoteForm
        action={updateAndRedirect}
        products={productsSerialized}
        initialData={{
          customerEmail:   quote.customerEmail,
          customerName:    quote.customerName    ?? undefined,
          customerCompany: quote.customerCompany ?? undefined,
          customerVatId:   quote.customerVatId   ?? undefined,
          customerPhone:   quote.customerPhone   ?? undefined,
          notes:           quote.notes           ?? undefined,
          adminNotes:      quote.adminNotes      ?? undefined,
          validUntil:      quote.validUntil?.toISOString().slice(0, 10),
          items: quote.items.map((i) => ({
            productId:   i.productId   ?? undefined,
            productName: i.productName,
            productSku:  i.productSku  ?? undefined,
            imageUrl:    i.imageUrl    ?? undefined,
            unitPrice:   Number(i.unitPrice),
            quantity:    i.quantity,
            note:        i.note        ?? undefined,
          })),
        }}
        submitLabel="Änderungen speichern"
      />
    </div>
  );
}
