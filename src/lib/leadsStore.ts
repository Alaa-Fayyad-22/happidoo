import { prisma } from "@/lib/prisma";
import type { QuoteInput } from "@/lib/validators";

export async function addLead(input: QuoteInput) {
  const notes = (input.notes ?? "").trim();

  const lead = await prisma.lead.create({
    data: {
      productSlug: input.productSlug && input.productSlug.trim() ? input.productSlug.trim() : null,
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

