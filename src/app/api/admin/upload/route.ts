import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/auth";
import { checkOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function safeExt(name: string) {
  const m = name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
  return m ? m[1] : null;
}

export async function POST(req: Request) {
  const csrf = checkOrigin(req);
  if (csrf) return csrf;

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

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

  if (file.size === 0) {
    return NextResponse.json({ ok: false, message: "Empty file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, message: "File too large (max 5 MB)" },
      { status: 413 }
    );
  }

  // Pin the stored content type to the validated extension. Trusting file.type
  // would let a caller store an object as text/html and have the bucket serve
  // it back as a script.
  const contentType = ALLOWED[ext];

  const bucket = "products";
  const id = crypto.randomUUID();
  const objectPath = `products/${id}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());

  const { data, error } = await getSupabaseService().storage.from(bucket).upload(objectPath, bytes, {
    contentType,
    upsert: false,
  });

  if (error) {
    console.error("Supabase upload error:", error.message);
    return NextResponse.json({ ok: false, message: "Upload failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, path: data?.path ?? objectPath }, { status: 200 });
}
