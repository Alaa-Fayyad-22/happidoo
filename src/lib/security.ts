import "server-only";
import { NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Origin check for cookie-authenticated state-changing requests.
 *
 * Supabase auth cookies default to SameSite=Lax, which already blocks most
 * cross-site sends, but multipart/form-data posts (see /api/admin/upload) are
 * CORS-"simple" requests and browsers send them without a preflight. Comparing
 * Origin against the request host closes that gap.
 *
 * Browsers always send Origin on non-GET/HEAD requests, so a missing Origin on
 * a mutating request is not a legitimate admin-UI call and is rejected.
 */
export function checkOrigin(req: Request): NextResponse | null {
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) return null;

  const origin = req.headers.get("origin");
  if (!origin) {
    return NextResponse.json(
      { ok: false, message: "Missing Origin header" },
      { status: 403 }
    );
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) {
    return NextResponse.json(
      { ok: false, message: "Missing Host header" },
      { status: 403 }
    );
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid Origin header" },
      { status: 403 }
    );
  }

  if (originHost !== host) {
    return NextResponse.json(
      { ok: false, message: "Cross-origin request rejected" },
      { status: 403 }
    );
  }

  return null;
}
