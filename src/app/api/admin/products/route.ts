// src/app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function toStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function toNullableInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  if (Number.isFinite(n)) return n;
  return null;
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

/**
 * Stable slug generator (no dependency).
 */
function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toStationId(v: unknown): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return n === 2 ? 2 : 1; // only allow 1 or 2, default 1
}


/**
 * Ensures slug uniqueness by suffixing: my-product, my-product-2, my-product-3 ...
 */
async function uniqueSlug(base: string): Promise<string> {
  const cleaned = slugify(base);
  const baseSlug = cleaned.length ? cleaned : `product-${Date.now()}`;

  // Fast path: base slug available
  const existing = await prisma.product.findUnique({ where: { slug: baseSlug }, select: { id: true } });
  if (!existing) return baseSlug;

  // Suffix loop (bounded)
  for (let i = 2; i <= 999; i++) {
    const candidate = `${baseSlug}-${i}`;
    const hit = await prisma.product.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!hit) return candidate;
  }

  // Fallback if somehow exhausted
  return `${baseSlug}-${Date.now()}`;
}

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const name = toStr(body?.name).trim();
  if (!name) return jsonError("name is required", 400);

  const category = toStr(body?.category).trim() || "general";
  const size = toStr(body?.size).trim();
  const features = toStr(body?.features).trim();
  const description = toStr(body?.description).trim();
  const imagePath = toStr(body?.imagePath).trim();
  const stationId = toStationId(body?.stationId);

  const priceFrom = toNullableInt(body?.priceFrom);
  const sortOrder = toNullableInt(body?.sortOrder) ?? 0;
  const isActive = toBool(body?.isActive, true);

  // slug derived from name (unique)
  const slug = await uniqueSlug(name);

  const created = await prisma.product.create({
    data: {
      name,
      slug,
      category,
      stationId,
      priceFrom,
      size,
      features,
      description,
      imagePath,
      isActive,
      sortOrder,
    },
  });

  return NextResponse.json({ product: created }, { status: 201 });
}
