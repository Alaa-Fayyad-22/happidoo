import "server-only";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Admin allowlist. Fail-closed: an unset/empty ADMIN_EMAILS grants nobody
 * access rather than everybody.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const allow = adminEmails();
  if (allow.length === 0) return false;
  return !!email && allow.includes(email.toLowerCase());
}

type AdminGate =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

/**
 * Verifies the caller is a signed-in user on the admin allowlist.
 *
 * The proxy already guards /admin and /api/admin, but route handlers must not
 * depend on it alone: a proxy-matcher gap or bypass would otherwise expose
 * every admin mutation directly. Callers do:
 *
 *   const gate = await requireAdmin();
 *   if (!gate.ok) return gate.response;
 */
export async function requireAdmin(): Promise<AdminGate> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (!isAdminEmail(user.email)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}
