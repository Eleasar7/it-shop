// app/auth/callback/route.ts
// Supabase redirects here after email confirmation

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncUserToDatabase } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync to our DB – pass name from user_metadata if available
      const name = data.user.user_metadata?.name as string | undefined;
      await syncUserToDatabase(data.user.id, data.user.email!, name).catch(
        (e) => console.error("[auth/callback] syncUser failed:", e)
      );
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
