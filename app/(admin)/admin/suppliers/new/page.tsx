// app/(admin)/admin/suppliers/new/page.tsx

import { requireAdmin } from "@/lib/auth";
import { SupplierForm } from "../[id]/SupplierForm";
import { createSupplier } from "@/app/actions/suppliers";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewSupplierPage() {
  await requireAdmin();
  return (
    <div className="space-y-6 max-w-xl">
      <Link href="/admin/suppliers" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ChevronLeft size={15} /> Lieferanten
      </Link>
      <h1 className="text-2xl font-bold text-slate-100">Neuer Lieferant</h1>
      <SupplierForm action={createSupplier} submitLabel="Lieferant anlegen" />
    </div>
  );
}
