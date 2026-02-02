import { prisma } from "@/lib/prisma";
import type { QuoteInput } from "@/lib/validators";

function normalizeSlugs(xs: unknown): string[] {
  if (!Array.isArray(xs)) return [];
  const cleaned = xs
    .map((v) => String(v).trim())
    .filter(Boolean);
  return Array.from(new Set(cleaned));
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

  const lead = await prisma.lead.create({
    data: {
      // Backward compatible: keep productSlug as the first item
      productSlug: merged[0] ?? null,

      // New: store full list (requires Prisma schema update)
      productSlugs: merged,

      eventDate: input.eventDate,
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
