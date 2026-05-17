import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (dbUser?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "No file uploaded" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filePath = `categories/${id}-${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("category-images")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("category-images")
    .getPublicUrl(filePath);

  const updated = await prisma.category.update({
    where: { id },
    data: {
      imageUrl: publicUrl,
    },
  });

  return NextResponse.json({
    success: true,
    imageUrl: publicUrl,
    category: updated,
  });
}