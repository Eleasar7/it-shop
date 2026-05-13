"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type CustomerActionState = { error?: string; success?: boolean };

export async function addCustomerNote(
  userId: string,
  content: string,
  authorId: string
): Promise<CustomerActionState> {
  await requireAdmin();
  if (!content.trim()) return { error: "Inhalt darf nicht leer sein." };
  try {
    await prisma.customerNote.create({ data: { userId, content: content.trim(), authorId } });
    revalidatePath(`/admin/customers/${userId}`);
    return { success: true };
  } catch (e) {
    console.error("[addCustomerNote]", e);
    return { error: "Datenbankfehler." };
  }
}

const crmSchema = z.object({
  company:       z.string().max(255).optional(),
  phone:         z.string().max(50).optional(),
  vatId:         z.string().max(50).optional(),
  b2bStatus:     z.enum(["NONE","PROSPECT","ACTIVE","INACTIVE"]),
  tags:          z.string().optional(), // comma-separated
  internalNotes: z.string().optional(),
});

export async function updateCustomerCRM(
  userId: string,
  _prev: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  await requireAdmin();

  const parsed = crmSchema.safeParse({
    company:       formData.get("company")       || undefined,
    phone:         formData.get("phone")         || undefined,
    vatId:         formData.get("vatId")         || undefined,
    b2bStatus:     formData.get("b2bStatus"),
    tags:          formData.get("tags")          || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: "Ungültige Daten." };

  const { tags, ...rest } = parsed.data;
  const tagsArray = tags
    ? tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  try {
    await prisma.user.update({
      where: { id: userId },
      data:  { ...rest, tags: tagsArray },
    });
    revalidatePath(`/admin/customers/${userId}`);
    return { success: true };
  } catch (e) {
    console.error("[updateCustomerCRM]", e);
    return { error: "Datenbankfehler." };
  }
}
