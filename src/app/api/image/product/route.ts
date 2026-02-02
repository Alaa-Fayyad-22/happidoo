import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) return NextResponse.json({ ok: false, message: "Missing path" }, { status: 400 });
  if (path.includes(":\\") || path.startsWith("C:\\")) {
  return NextResponse.json({ ok: false, message: "Invalid storage path" }, { status: 400 });
}

  const { data, error } = await supabaseService.storage
    .from("products")
    .createSignedUrl(path, 60 * 10); // 10 minutes

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, url: data.signedUrl }, { status: 200 });
}
