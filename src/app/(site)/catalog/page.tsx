// src/app/(site)/catalog/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { supabaseService } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ProductRow = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

// ── Sign directly via Supabase SDK — no self-fetch, no header dependency ──────
async function signProductImage(path: string): Promise<string | null> {
  const p = (path || "").trim();
  if (!p) return null;

  const { data, error } = await supabaseService.storage
    .from("products")
    .createSignedUrl(p, 60 * 60); // 1 hour

  if (error) {
    console.error("Catalog sign error:", error);
    return null;
  }
  return data?.signedUrl ?? null;
}

// ── Tab helper ────────────────────────────────────────────────────────────────
const tabClass = (active: boolean, theme?: "bounce" | "snack") => {
  if (!active) {
    return "inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold bg-white text-slate-700 hover:bg-slate-50 transition";
  }
  if (theme === "bounce") {
    return "inline-flex items-center justify-center rounded-full bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-white transition";
  }
  if (theme === "snack") {
    return "inline-flex items-center justify-center rounded-full bg-[#00A0E9] px-4 py-2 text-sm font-semibold text-white transition";
  }
  return "inline-flex items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition";
};

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ p }: { p: ProductRow & { signedImageUrl: string | null } }) {
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[1.5/1] sm:aspect-[3/2] bg-slate-100">
        {p.signedImageUrl ? (
          <img
            src={p.signedImageUrl}
            alt={p.name}
            // First few images are above the fold — load eagerly
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            {p.category || "general"}
          </span>
        </div>
      </div>

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
          <span className="text-sm font-semibold text-slate-900 group-hover:translate-x-0.5 transition">→</span>
        </div>
      </div>
    </Link>
  );
}

// ── Skeleton grid ─────────────────────────────────────────────────────────────
function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl border bg-white shadow-sm animate-pulse">
          <div className="aspect-[3/2] bg-slate-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
            <div className="h-4 w-1/2 rounded-lg bg-slate-200" />
            <div className="h-4 w-full rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Async grid — awaits the pre-kicked promise ────────────────────────────────
async function CatalogGrid({
  itemsPromise,
}: {
  itemsPromise: Promise<(ProductRow & { signedImageUrl: string | null })[]>;
}) {
  const items = await itemsPromise;

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border bg-white p-6 text-slate-600">
        No products available right now.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ station?: string }>;
}) {
  const sp = await searchParams;
  const station = sp?.station;
  const whereStation = station === "1" ? 1 : station === "2" ? 2 : null;

  // 🔑 Fire DB query + all signing in parallel immediately — no await here.
  //    By the time React renders <CatalogGrid>, the promise is already resolving.
  const itemsPromise = prisma.product
    .findMany({
      where: {
        isActive: true,
        ...(whereStation ? { stationId: whereStation } : {}),
      },
      orderBy: [{ stationId: "asc" }],
    })
    .then((products) =>
      Promise.all(
        products.map(async (p) => ({
          ...p,
          signedImageUrl: p.imagePath ? await signProductImage(p.imagePath) : null,
        }))
      )
    );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      {/* Header — static, renders instantly */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Available rentals
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Catalog</h1>
            <p className="mt-2 text-slate-600">
              Browse Bounce Stations and Snack Stations. Tap an item to view details and request a quote.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/catalog?station=1" className={tabClass(station === "1", "bounce")}>
                Bounce Stations
              </Link>
              <Link href="/catalog?station=2" className={tabClass(station === "2", "snack")}>
                Snack Stations
              </Link>
              <Link href="/catalog" className={tabClass(!station || station === "all")}>
                All
              </Link>
            </div>
          </div>

          <Link
            href="/quote"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            Get a Quote
          </Link>
        </div>
      </div>

      {/* Grid streams in; skeleton holds space while signing resolves */}
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogGrid itemsPromise={itemsPromise} />
      </Suspense>
    </main>
  );
}