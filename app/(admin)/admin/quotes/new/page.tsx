// app/(admin)/admin/quotes/new/page.tsx

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuoteForm } from "@/components/admin/QuoteForm";
import { createQuote } from "@/app/actions/quotes";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Neues Angebot | TechCore Admin" };

interface PageProps {
  searchParams: Promise<{ b2bId?: string; email?: string; company?: string; name?: string }>;
}

export default async function NewQuotePage({ searchParams }: PageProps) {
  await requireAdmin();
  const { b2bId, email, company, name } = await searchParams;

  // Pre-fill from B2B request if given
  let b2bData: { customerEmail?: string; customerName?: string; customerCompany?: string; b2bRequestId?: string } = {};
  if (b2bId) {
    const req = await prisma.b2BRequest.findUnique({
      where: { id: b2bId },
      select: { email: true, contactName: true, companyName: true },
    });
    if (req) {
      b2bData = {
        customerEmail:   req.email,
        customerName:    req.contactName,
        customerCompany: req.companyName,
        b2bRequestId:    b2bId,
      };
    }
  }

  const products = await prisma.product.findMany({
    where:   { isActive: true },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, sku: true, price: true, images: true, brand: true },
  });

  const productsSerialized = products.map((p) => ({ ...p, price: Number(p.price) }));

  // Wrap action to redirect on success
  async function createAndRedirect(prev: any, fd: FormData) {
    "use server";
    const result = await createQuote(prev, fd);
    if (result.success && result.quoteId) {
      redirect(`/admin/quotes/${result.quoteId}`);
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/quotes" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4">
          <ChevronLeft size={15} /> Zurück zu Angeboten
        </Link>
        <h1 className="text-2xl font-bold text-slate-100">Neues Angebot</h1>
        <p className="text-slate-500 text-sm mt-1">Erstelle ein individuelles Angebot für einen Kunden</p>
      </div>

      <QuoteForm
        action={createAndRedirect}
        products={productsSerialized}
        initialData={{
          ...b2bData,
          customerEmail: b2bData.customerEmail ?? email,
          customerName:  b2bData.customerName  ?? name,
          customerCompany: b2bData.customerCompany ?? company,
        }}
        submitLabel="Angebot erstellen"
      />
    </div>
  );
}
