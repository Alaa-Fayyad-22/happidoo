// src/app/api/admin/leads/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type LeadRow = {
  id: string;
  createdAt: Date;
  status: string;
  productSlug: string | null;
  eventDate: string;
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

  // collect unique product slugs
  const slugs = Array.from(
    new Set(
      leads
        .map((l: LeadRow) => l.productSlug)
        .filter((s: string | null): s is string => typeof s === "string")
    )
  );

  const products = slugs.length
    ? await prisma.product.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, name: true },
      })
    : [];

  const productMap = new Map<string, string>();
  for (const p of products) {
    productMap.set(p.slug, p.name);
  }

  const leadsWithProduct = leads.map((l: LeadRow) => ({
    ...l,
    productName: l.productSlug ? productMap.get(l.productSlug) ?? null : null,
  }));

  return NextResponse.json(
    { ok: true, leads: leadsWithProduct },
    { status: 200 }
  );
}
