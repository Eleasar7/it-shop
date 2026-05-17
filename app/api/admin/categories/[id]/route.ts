import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (dbUser?.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { user: dbUser };
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const body = await req.json();
  const { name, description, imageUrl, sortOrder, icon } = body;

  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(icon !== undefined && { icon }),
    },
  });

  return NextResponse.json(updated);
}