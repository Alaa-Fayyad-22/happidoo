// src/app/(site)/catalog/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;


type ProductRow = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

type SignedUrlResp = { url: string };

async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  return `${proto}://${host}`;
}

async function signProductImage(imagePath: string): Promise<string | null> {
  const path = (imagePath || "").trim();
  if (!path) return null;

  const base = await getBaseUrlFromHeaders();
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/image/product?path=${encodeURIComponent(path)}`, {
      method: "GET",
      next: { revalidate: 60 * 9 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SignedUrlResp;
    return data?.url || null;
  } catch {
    return null;
  }
}


export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const items = await Promise.all(
    products.map(async (p: ProductRow) => ({
  ...p,
  signedImageUrl: p.imagePath ? await signProductImage(p.imagePath) : null,
}))
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Available rentals
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Catalog</h1>
            <p className="mt-2 text-slate-600">
              Browse inflatables. Tap an item to view details and request a quote.
            </p>
          </div>

          <Link
            href="/quote"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Get a Quote
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border bg-white p-6 text-slate-600">
          No products available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Image */}
              <div className="relative h-52 bg-slate-100">
                {p.signedImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.signedImageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    No image
                  </div>
                )}

                {/* Category pill */}
                <div className="absolute left-3 top-3">
                  <span className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                    {p.category || "general"}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold text-slate-900">{p.name}</div>
                    <div className="mt-1 text-sm text-slate-600 truncate">
                      {p.size ? `Size: ${p.size}` : "Size: —"}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {p.priceFrom == null ? "Quote" : `$${p.priceFrom}`}
                  </div>
                </div>

                {p.description ? (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">{p.description}</p>
                ) : (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">
                    Tap to view details and request a quote.
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">View details</span>
                  <span className="text-sm font-semibold text-slate-900 group-hover:translate-x-0.5 transition">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
