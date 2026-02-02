// src/app/api/admin/leads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AllowedStatus = ["new", "contacted", "booked", "closed"] as const;
type LeadStatus = (typeof AllowedStatus)[number];

function isAllowedStatus(x: unknown): x is LeadStatus {
  return typeof x === "string" && (AllowedStatus as readonly string[]).includes(x);
}

async function enrichLead(lead: any) {
  // normalize slugs
  const slugs: string[] =
    Array.isArray(lead.productSlugs) && lead.productSlugs.length > 0
      ? lead.productSlugs
      : lead.productSlug
      ? [lead.productSlug]
      : [];

  // fetch names
  const products = slugs.length
    ? await prisma.product.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, name: true },
      })
    : [];

  const nameBySlug = new Map(products.map((p) => [p.slug, p.name]));
  const names = slugs.map((s) => nameBySlug.get(s) ?? s);

  return {
    ...lead,
    productSlugs: slugs,
    productNames: names,
    // backward compatible
    productSlug: slugs[0] ?? null,
    productName: names[0] ?? null,
  };
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const p =
    typeof (ctx.params as any)?.then === "function"
      ? await (ctx.params as Promise<{ id: string }>)
      : (ctx.params as { id: string });

  const id = p?.id;
  if (!id) {
    return NextResponse.json({ ok: false, message: "Missing id." }, { status: 400 });
  }

  let raw: any = null;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  const status = raw?.status;
  const notes = raw?.notes;

  if (status !== undefined && !isAllowedStatus(status)) {
    return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
  }

  if (notes !== undefined && typeof notes !== "string") {
    return NextResponse.json({ ok: false, message: "Invalid notes." }, { status: 400 });
  }

  if (status === undefined && notes === undefined) {
    return NextResponse.json({ ok: false, message: "No fields to update." }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  const enriched = await enrichLead(lead);

  return NextResponse.json({ ok: true, lead: enriched }, { status: 200 });
}
