//src\app\api\image\product\route.ts
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { supabaseService } from "@/lib/supabase/service";


export const dynamic = "force-dynamic";


function isSafeStoragePath(path: string) {
  const p = path.trim();
  if (!p) return false;
  if (p.includes("..")) return false;
  if (p.includes("\\")) return false;
  if (p.includes("://")) return false;
  return true;
}


function getSignedUrlCached(path: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await supabaseService.storage
        .from("products")
        .createSignedUrl(path, 60 * 60); // 1 hour is fine

      if (error) throw new Error(error.message);
      return data.signedUrl;
    },
    // ✅ key includes the path so each image caches separately
    ["product-signed-url", path],
    { revalidate: 60 * 9 }
  )();
}



export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ ok: false, message: "Missing path" }, { status: 400 });
  }
  if (!isSafeStoragePath(path)) {
    return NextResponse.json({ ok: false, message: "Invalid storage path" }, { status: 400 });
  }

  try {
    const url = await getSignedUrlCached(path.trim());
    return NextResponse.json({ ok: true, url }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message || "Failed" }, { status: 400 });
  }
}
