"use server";

// app/actions/b2b.ts

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const updateSchema = z.object({
  status:     z.enum(["OPEN","IN_REVIEW","QUOTED","ACCEPTED","REJECTED","CLOSED"]),
  adminNotes: z.string().optional(),
});

export type B2BUpdateState = { error?: string; success?: boolean };

export async function updateB2BStatus(
  id: string,
  _prev: B2BUpdateState,
  formData: FormData
): Promise<B2BUpdateState> {
  await requireAdmin();
  const parsed = updateSchema.safeParse({
    status:     formData.get("status"),
    adminNotes: formData.get("adminNotes") || undefined,
  });
  if (!parsed.success) return { error: "Ungültige Statuswerte." };
  try {
    await prisma.b2BRequest.update({ where: { id }, data: parsed.data });
    revalidatePath(`/admin/b2b/${id}`);
    revalidatePath("/admin/b2b");
    revalidatePath("/admin"); // refresh dashboard count
    return { success: true };
  } catch (e) {
    console.error("[updateB2BStatus]", e);
    return { error: "Datenbankfehler." };
  }
}
