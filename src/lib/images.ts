// src/lib/images.ts
import { unstable_cache } from "next/cache";
import { getSupabaseService } from "@/lib/supabase/service";

const BUCKET = "products";
const SIGNED_URL_TTL = 60 * 60 * 2; // 2h — token lifetime
const CACHE_TTL = 60 * 60; // 1h — always well inside the token lifetime

/**
 * Widths we sign at. The transform is signed *into* the token, so it can't be
 * varied per-request the way an optimizer's `w` param can — pick the widest
 * slot the image is rendered in.
 */
export const IMAGE_WIDTH = {
  card: 828, // catalog / slider cards
  hero: 1200, // product page hero, homepage hero
} as const;

/**
 * Signs a product image URL with a Supabase edge transform baked in.
 *
 * Source objects are 1–2 MB PNGs. Supabase's render endpoint resizes them and
 * content-negotiates WebP off the browser's `Accept` header, which takes a
 * typical product image from ~1.6 MB to ~60 KB. That is what makes these safe
 * to hand straight to the browser with `unoptimized` — routing them through
 * Next's optimizer instead makes the server fetch the full-size PNG, which is
 * what was blowing past its 7s upstream-fetch abort and returning 500s.
 */
async function sign(path: string, width: number): Promise<string | null> {
  const { data, error } = await getSupabaseService().storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL, {
      transform: { width, resize: "contain", quality: 75 },
    });

  if (error) {
    console.error(`[images] failed to sign "${path}":`, error.message);
    return null;
  }

  return data?.signedUrl ?? null;
}

/**
 * Signing is a network round-trip to Supabase, and the catalog signs one per
 * product on every request — so cache per (path, width).
 */
export function signProductImage(
  path: string | null | undefined,
  width: number = IMAGE_WIDTH.card
): Promise<string | null> {
  const p = path?.trim();
  if (!p) return Promise.resolve(null);

  return unstable_cache(() => sign(p, width), ["product-signed-url", p, String(width)], {
    revalidate: CACHE_TTL,
  })();
}
