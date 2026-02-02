import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

function safeExt(name: string) {
  const m = name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return m ? m[1] : null;
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Missing file" }, { status: 400 });
  }

  const ext = safeExt(file.name);
  if (!ext) {
    return NextResponse.json(
      { ok: false, message: "Only jpg, jpeg, png, webp allowed" },
      { status: 400 }
    );
  }

  const bucket = "products"; // ✅ change to your actual Supabase bucket name
  const id = crypto.randomUUID();
  const objectPath = `products/${id}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());

  const { data, error } = await supabaseService.storage.from(bucket).upload(objectPath, bytes, {
    contentType: file.type || `image/${ext}`,
    upsert: false,
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: "Supabase upload error", details: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, path: data?.path ?? objectPath }, { status: 200 });
}
