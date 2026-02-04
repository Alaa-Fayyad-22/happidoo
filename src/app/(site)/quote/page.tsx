// src/app/(site)/quote/page.tsx
import { prisma } from "@/lib/prisma";
import QuoteFormClient from "./quoteFormClient";

function parseSelectedProducts(sp: Record<string, any>): string[] {
  const raw = sp?.product;
  const values: string[] = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return Array.from(
    new Set(
      values
        .flatMap((v) => String(v).split(",")) // allow comma-separated too
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

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

  const requestedSlugs = parseSelectedProducts(sp);

  // const products = await prisma.product.findMany({
  //   where: { isActive: true },
  //   orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  //   select: { slug: true, name: true },
  // });

    const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { slug: true, name: true, imagePath: true }, // ✅ add imagePath
  });

const products = dbProducts.map((p) => ({
  slug: p.slug,
  name: p.name,
  imagePath: p.imagePath ? String(p.imagePath).replace(/^\/+/, "") : null, // keep folders
}));



  const active = new Set(products.map((p) => p.slug));
  const initialSelectedSlugs = requestedSlugs.filter((s) => active.has(s));

  return (
    <QuoteFormClient
      products={products}
      initialSelectedSlugs={initialSelectedSlugs}
    />
  );
}
