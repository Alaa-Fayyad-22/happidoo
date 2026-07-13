//src\app\api\image\product\route.ts
import { NextResponse } from "next/server";
import { signProductImage } from "@/lib/images";


export const dynamic = "force-dynamic";


function isSafeStoragePath(path: string) {
  const p = path.trim();
  if (!p) return false;
  if (p.includes("..")) return false;
  if (p.includes("\\")) return false;
  if (p.includes("://")) return false;
  return true;
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

  const url = await signProductImage(path.trim());
  if (!url) {
    return NextResponse.json({ ok: false, message: "Failed to sign image" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, url }, { status: 200 });
}
