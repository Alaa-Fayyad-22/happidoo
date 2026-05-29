// src/lib/images.ts
import { unstable_cache } from "next/cache";
import { supabaseService } from "@/lib/supabase/service";

const BUCKET = "products";
const SIGNED_URL_TTL = 60 * 60 * 6; // 6 hours in seconds
const CACHE_TTL = 60 * 60 * 5;      // cache for 5 hours (less than TTL so it never expires before refresh)

// Cached per imagePath — only calls Supabase once per 5 hours per image
export const getSignedImageUrl = unstable_cache(
  async (imagePath: string): Promise<string | null> => {
    if (!imagePath?.trim()) return null;

    const { data, error } = await supabaseService.storage
      .from(BUCKET)
      .createSignedUrl(imagePath, SIGNED_URL_TTL);

    if (error) {
      console.error("Sign error for", imagePath, error.message);
      return null;
    }

    return data.signedUrl ?? null;
  },
  ["signed-image-url"],     // cache key prefix
  { revalidate: CACHE_TTL } // Next.js cache duration
);