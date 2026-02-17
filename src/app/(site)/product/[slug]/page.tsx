// src/app/(site)/product/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

type SignedUrlResp = { url: string };

async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  return `${proto}://${host}`;
}

async function signProductImage(path?: string): Promise<string | null> {
  const trimmed = path?.trim();
  if (!trimmed) return null;

  const base = await getBaseUrlFromHeaders();
  if (!base) return null;

  try {
    const res = await fetch(
      `${base}/api/image/product?path=${encodeURIComponent(trimmed)}`,
      { method: "GET", cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as SignedUrlResp;
    return data?.url ?? null;
  } catch {
    return null;
  }
}

type Params = { slug: string };
type Props = { params: Params | Promise<Params> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await Promise.resolve(params) ?? {};
  if (!slug?.trim()) notFound();

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product?.isActive) notFound();

  const signedImageUrl = await signProductImage(product.imagePath);

  const featuresList = (product.features || "")
    .split(/\r?\n|,/)
    .map((f) => f.trim())
    .filter(Boolean);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to catalog
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Image */}
        <section className="overflow-hidden rounded-3xl border bg-white shadow-sm relative">
          {signedImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={signedImageUrl}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="relative aspect-[7/4] sm:aspect-[5/3] bg-slate-100 flex items-center justify-center text-xs text-slate-400">
              No image
            </div>
          )}

          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              {product.category || "general"}
            </span>
          </div>
        </section>

        {/* Details */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight">{product.name}</h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-2xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {product.priceFrom == null ? "Get quote" : `$${product.priceFrom}`}
                </span>
                {product.size && (
                  <span className="rounded-2xl border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    Size: {product.size}
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/quote?product=${encodeURIComponent(product.slug)}`}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Request a quote
            </Link>
          </div>

          {product.description && (
            <div className="mt-6">
              <div className="text-sm font-semibold text-slate-900">Description</div>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {product.description}
              </div>
            </div>
          )}

          {featuresList.length > 0 && (
            <div className="mt-6">
              <div className="text-sm font-semibold text-slate-900">Features</div>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {featuresList.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-2xl border bg-slate-50 p-3 text-sm text-slate-700"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-xs">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next steps */}
          <div className="mt-8 rounded-3xl border bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-700">Next steps</div>
            <div className="mt-1 text-sm text-slate-600">
              Request a quote with your date and location. We’ll confirm availability and final price.
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/quote?product=${encodeURIComponent(product.slug)}`}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Get quote for this item
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center rounded-2xl border bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Browse more
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
