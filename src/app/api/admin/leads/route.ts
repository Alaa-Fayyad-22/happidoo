// src/app/api/admin/leads/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LeadRow = {
  id: string;
  createdAt: Date;
  status: string;

  productSlug: string | null;
  productSlugs: string[];

  eventStartDate: string;
  eventEndDate: string;

  timeWindow: string;
  city: string;
  address: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
};

export async function GET() {
  const leads = (await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  })) as LeadRow[];

  // collect unique product slugs (support multi + fallback single)
  const slugs = Array.from(
    new Set(
      leads
        .flatMap((l) => (Array.isArray(l.productSlugs) && l.productSlugs.length ? l.productSlugs : []))
        .concat(
          leads
            .map((l) => l.productSlug)
            .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
        )
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );

  const products = slugs.length
    ? await prisma.product.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, name: true },
      })
    : [];

  const nameBySlug = new Map(products.map((p) => [p.slug, p.name]));

  const leadsEnriched = leads.map((l) => {
    const normalizedSlugs =
      Array.isArray(l.productSlugs) && l.productSlugs.length > 0
        ? l.productSlugs
        : l.productSlug
        ? [l.productSlug]
        : [];

    const productNames = normalizedSlugs.map((s) => nameBySlug.get(s) ?? s);

    return {
      ...l,
      // keep your old single display fields working
      productSlug: normalizedSlugs[0] ?? null,
      productName: normalizedSlugs[0] ? nameBySlug.get(normalizedSlugs[0]) ?? null : null,

      // add multi fields for badges UI
      productSlugs: normalizedSlugs,
      productNames,
    };
  });

  return NextResponse.json({ ok: true, leads: leadsEnriched }, { status: 200 });
}
