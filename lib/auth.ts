// lib/auth.ts

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { UserProfile } from "@/types";

// ─── Shared select shape ──────────────────────────────────────────────────────
// NOTE: createdAt is intentionally excluded — it's a Date object and cannot
// be passed from a Server Component to a Client Component as a prop.
// If a page needs createdAt, serialize it to a string explicitly in that page.
const USER_SELECT = {
  id:       true,
  email:    true,
  name:     true,
  role:     true,
  company:  true,
  phone:    true,
} as const;

// ─── getAuthUser ──────────────────────────────────────────────────────────────

/**
 * Returns the JWT-verified Supabase user, or null if not authenticated.
 * Uses getUser() (network round-trip) — NOT getSession() (local cookie only).
 */
export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ─── getCurrentUser ───────────────────────────────────────────────────────────

/**
 * Returns the full UserProfile from our Prisma DB for the currently
 * authenticated Supabase user, with three-state healing:
 *
 *  State 1 – Normal: id matches → return user (preserves ADMIN role). ✓
 *
 *  State 2 – UUID mismatch (same email, different id) → update the id,
 *            return existing row with its existing role (ADMIN preserved). ✓
 *
 *  State 3 – No row at all → create with role: "USER".
 *            SAFETY: if the INSERT fails due to an email unique constraint
 *            (ultra-rare race where another process created it first), we
 *            fall back to a find-by-email so we never lose an ADMIN role. ✓
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const authEmail = authUser.email ?? "";

  // ── 1. Look up by Supabase UUID (the fast, normal path) ──────────────────
  try {
    const byId = await prisma.user.findUnique({
      where:  { id: authUser.id },
      select: USER_SELECT,
    });
    if (byId) return byId;
  } catch (err) {
    console.error("[getCurrentUser] findUnique by id failed:", err);
  }

  // ── 2. Look up by email (handles UUID mismatch) ───────────────────────────
  try {
    const byEmail = await prisma.user.findUnique({
      where:  { email: authEmail },
      select: USER_SELECT,
    });

    if (byEmail) {
      if (byEmail.id === authUser.id) {
        return byEmail;
      }

      // Update the stale id to the current Supabase id.
      // IMPORTANT: only update id — never touch role.
      try {
        const updated = await prisma.user.update({
          where:  { email: authEmail },
          data:   { id: authUser.id },
          select: USER_SELECT,
        });
        return updated;
      } catch (updateErr) {
        console.error("[getCurrentUser] id update failed:", updateErr);
        return byEmail; // return with old id — still the right user & role
      }
    }
  } catch (err) {
    console.error("[getCurrentUser] findUnique by email failed:", err);
  }

  // ── 3. No row at all — create a fresh one with role: "USER" ───────────────
  // This is correct for genuinely new users.
  // SAFETY: if the INSERT fails on email unique constraint (race condition
  // or a row that somehow slipped past the earlier checks), we read the
  // existing row rather than throwing — preserving whatever role it has.
  try {
    const created = await prisma.user.create({
      data: {
        id:    authUser.id,
        email: authEmail,
        name:  (authUser.user_metadata?.name as string | undefined) ?? null,
        role:  "USER",
      },
      select: USER_SELECT,
    });
    return created;
  } catch (createErr: unknown) {
    console.error("[getCurrentUser] create failed:", createErr);

    // Last-resort reads — preserves ADMIN role if the row already existed.
    try {
      const fallback =
        (await prisma.user.findUnique({ where: { id: authUser.id }, select: USER_SELECT })) ??
        (await prisma.user.findUnique({ where: { email: authEmail }, select: USER_SELECT }));
      if (fallback) return fallback;
    } catch { /* truly unrecoverable */ }

    return null;
  }
}

// ─── requireAuth ─────────────────────────────────────────────────────────────

export async function requireAuth(): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// ─── requireAdmin ─────────────────────────────────────────────────────────────

export async function requireAdmin(): Promise<UserProfile> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    redirect("/");
  }
  return user;
}

// ─── syncUserToDatabase ───────────────────────────────────────────────────────

/**
 * Idempotent upsert called after Supabase signUp / email confirmation.
 *
 * CRITICAL: the update path intentionally does NOT include `role`.
 * This guarantees that an existing ADMIN user never gets downgraded
 * to USER by a repeated sync call (e.g. after re-login or token refresh).
 */
export async function syncUserToDatabase(
  supabaseUserId: string,
  email: string,
  name?: string
): Promise<void> {
  try {
    await prisma.user.upsert({
      where:  { id: supabaseUserId },
      // update: never touches role — preserves ADMIN
      update: { email, ...(name ? { name } : {}) },
      create: { id: supabaseUserId, email, name: name ?? null, role: "USER" },
    });
    return;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Unique constraint") && msg.includes("email")) {
      // Another row with this email exists under a different id.
      // getCurrentUser() will heal the id mismatch on first request.
      console.warn(
        "[syncUserToDatabase] email already exists under a different id — " +
        "getCurrentUser() will reconcile on next request.",
        { supabaseUserId, email }
      );
      return;
    }
    throw err;
  }
}

// ─── getSession (legacy) ─────────────────────────────────────────────────────

/**
 * @deprecated Use getAuthUser() instead.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
