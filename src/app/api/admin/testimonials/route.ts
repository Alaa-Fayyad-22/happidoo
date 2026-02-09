// src/app/api/admin/testimonials/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function toStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function toInt(v: unknown, fallback: number): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 0);
  return Number.isFinite(n) ? n : fallback;
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
 * GET /api/admin/testimonials?status=pending|approved|hidden|all&limit=50
 * - pending: isApproved=false AND isHidden=false
 * - approved: isApproved=true AND isHidden=false
 * - hidden:  isHidden=true
 * - all:     no filter
 */
export async function GET(req: Request) {
  const url = new URL(req.url);

  const status = (toStr(url.searchParams.get("status")) || "pending").toLowerCase();
  const limitRaw = toInt(url.searchParams.get("limit"), 50);
  const limit = Math.max(1, Math.min(limitRaw, 200)); // 1..200

  let where: any;

  if (status === "approved") {
    where = { isApproved: true, isHidden: false };
  } else if (status === "hidden") {
    where = { isHidden: true };
  } else if (status === "all") {
    where = {};
  } else {
    // default = pending
    where = { isApproved: false, isHidden: false };
  }

  const items = await prisma.testimonial.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ items });
}

/**
 * Optional: create a testimonial manually from admin.
 * POST /api/admin/testimonials
 * body: { rating, message?, name?, city?, source?, isApproved?, isHidden? }
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const rating = toInt(body?.rating, 0);
  if (rating < 1 || rating > 5) return jsonError("rating must be between 1 and 5", 400);

  const message = toStr(body?.message).trim() || null;
  const name = toStr(body?.name).trim() || null;
  const city = toStr(body?.city).trim() || null;
  const source = toStr(body?.source).trim() || "admin";

  const isApproved = toBool(body?.isApproved, false);
  const isHidden = toBool(body?.isHidden, false);

  const created = await prisma.testimonial.create({
    data: {
      rating,
      message,
      name,
      city,
      source,
      isApproved,
      isHidden,
    },
  });

  return NextResponse.json({ item: created }, { status: 201 });
}
