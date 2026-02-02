// src/app/(site)/quote/page.tsx
import { prisma } from "@/lib/prisma";
import QuoteFormClient from "./quoteFormClient";

export default async function QuotePage({
  searchParams,
}: {
  searchParams:
    | Record<string, string | string[] | undefined>
    | Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp =
    typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<Record<string, any>>)
      : (searchParams as Record<string, any>);

  const raw = sp?.product;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  const productSlug = (slug || "").trim();

  let confirmedSlug: string | null = null;
  let productName: string | null = null;

  if (productSlug) {
    const p = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (p && p.isActive) {
      confirmedSlug = p.slug;
      productName = p.name;
    }
  }

  return <QuoteFormClient productSlug={confirmedSlug} productName={productName} />;
}
