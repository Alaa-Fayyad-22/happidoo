// src/app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateTag, revalidatePath } from "next/cache";


function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function toStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function toNullableInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function toBool(v: unknown, defaultValue: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(s)) return true;
    if (["false", "0", "no", "n", "off"].includes(s)) return false;
  }
  if (typeof v === "number") return v !== 0;
  return defaultValue;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function uniqueSlugForUpdate(base: string, productId: string): Promise<string> {
  const cleaned = slugify(base);
  const baseSlug = cleaned.length ? cleaned : `product-${Date.now()}`;

  const existing = await prisma.product.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });

  if (!existing || existing.id === productId) return baseSlug;

  for (let i = 2; i <= 999; i++) {
    const candidate = `${baseSlug}-${i}`;
    const hit = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!hit || hit.id === productId) return candidate;
  }

  return `${baseSlug}-${Date.now()}`;
}

// ✅ Next.js 16: params can be a Promise
type Ctx = { params: Promise<{ id: string }> | { id: string } };

async function getId(ctx: Ctx): Promise<string> {
  const params = await (ctx.params as any);
  const id = params?.id;
  return typeof id === "string" ? id : "";
}
function toStationId(v: unknown): number {
  const n = parseInt(String(v ?? "").trim(), 10);
  return n === 2 ? 2 : 1; // allow only 1 or 2
}


export async function PATCH(req: Request, ctx: Ctx) {
  const id = await getId(ctx);
  if (!id) return jsonError("Missing product id", 400);
  

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found", 404);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  // Only update fields present (prevents accidental overwrites)
  const data: any = {};

  if ("name" in body) {
    const name = toStr(body?.name).trim();
    if (!name) return jsonError("name cannot be empty", 400);
    data.name = name;

    // If name changed, update slug (unique). If same name, keep slug.
    if (name !== existing.name) {
      data.slug = await uniqueSlugForUpdate(name, id);
    }
  }

  if ("category" in body) data.category = toStr(body?.category).trim() || "general";
  if ("size" in body) data.size = toStr(body?.size).trim();
  if ("features" in body) data.features = toStr(body?.features).trim();
  if ("description" in body) data.description = toStr(body?.description).trim();
  if ("imagePath" in body) data.imagePath = toStr(body?.imagePath).trim();
  if ("stationId" in body) data.stationId = toStationId(body?.stationId);

  if ("priceFrom" in body) data.priceFrom = toNullableInt(body?.priceFrom);
  if ("sortOrder" in body) data.sortOrder = toNullableInt(body?.sortOrder) ?? 0;
  if ("isActive" in body) data.isActive = toBool(body?.isActive, existing.isActive);

  if (Object.keys(data).length === 0) {
    return jsonError("No valid fields provided to update", 400);
  }

  const updated = await prisma.product.update({ where: { id }, data });

  revalidateTag("product-signed-url", "max");

// Optional but nice: if you ever cache the pages, this forces refresh
  revalidatePath("/");
  revalidatePath("/catalog");

  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const id = await getId(ctx);
  if (!id) return jsonError("Missing product id", 400);

  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return jsonError("Product not found", 404);

  await prisma.product.delete({ where: { id } });
  revalidateTag("product-signed-url", "max");
  revalidatePath("/");
  revalidatePath("/catalog");
  return NextResponse.json({ ok: true });
}
