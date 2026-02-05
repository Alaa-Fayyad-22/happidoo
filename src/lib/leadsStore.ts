// src/lib/leadsStore.ts
import { prisma } from "@/lib/prisma";
import type { QuoteInput } from "@/lib/validators";

function normalizeSlugs(xs: unknown): string[] {
  if (!Array.isArray(xs)) return [];
  const cleaned = xs.map((v) => String(v).trim()).filter(Boolean);
  return Array.from(new Set(cleaned));
}

function normalizeDateRange(input: QuoteInput) {
  // In case UI sends only start (or only end), we make it sane:
  const start = (input as any).eventStartDate?.trim?.() ?? "";
  const end = (input as any).eventEndDate?.trim?.() ?? "";

  if (start && !end) return { eventStartDate: start, eventEndDate: start };
  if (!start && end) return { eventStartDate: end, eventEndDate: end };
  return { eventStartDate: start, eventEndDate: end };
}

export async function addLead(input: QuoteInput) {
  const notes = (input.notes ?? "").trim();

  const single = (input.productSlug ?? "").trim();

  // New: productSlugs array (multi-select)
  const array = normalizeSlugs((input as any).productSlugs);
  

  // Merge logic:
  // - if array exists, use it
  // - else fall back to old single slug
  const merged = array.length > 0 ? array : single ? [single] : [];
  
  const products = merged.length
  ? await prisma.product.findMany({
      where: { slug: { in: merged } },
      select: { slug: true, name: true },
    })
  : [];

const nameBySlug = new Map(products.map((p) => [p.slug, p.name]));
const productNames = merged.map((s) => nameBySlug.get(s) ?? s);


  const { eventStartDate, eventEndDate } = normalizeDateRange(input);

  const lead = await prisma.lead.create({
    data: {
      // Backward compatible: keep productSlug as the first item
      productSlug: merged[0] ?? null,

      // New: store full list
      productSlugs: merged,
      productNames,

      // changed: date range
      eventStartDate,
      eventEndDate,

      timeWindow: input.timeWindow,
      city: input.city,
      address: input.address,
      name: input.name,
      phone: input.phone,
      email: input.email,
      notes,
    },
  });

  return lead;
}

export async function listLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}

export async function updateLead(
  id: string,
  patch: { status?: string; notes?: string }
) {
  const exists = await prisma.lead.findUnique({ where: { id } });
  if (!exists) return null;

  const updated = await prisma.lead.update({
    where: { id },
    data: {
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
    },
  });

  return updated;
}
