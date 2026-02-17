// src/app/(site)/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import TestimonialsSection from "@/components/TestimonialsSection";
import HeroSlider from "@/components/HeroSlider";
import { supabaseService } from "@/lib/supabase/service";

import "./globals.css";

type ProductRow = Awaited<ReturnType<typeof prisma.product.findMany>>[number];

async function signProductImage(path: string): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabaseService.storage
    .from("products")
    .createSignedUrl(path, 60 * 60);
  if (error) { console.error("Sign error:", error); return null; }
  return data?.signedUrl ?? null;
}

// ── Static UI pieces ──────────────────────────────────────────────────────────

function StatPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm shadow-sm backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span className="text-slate-700">{label}</span>
    </div>
  );
}

function StepCard({ step, title, desc, titleClassName }: {
  step: string; title: string; desc: string; titleClassName?: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-black/5 text-sm font-bold text-slate-900">
          {step}
        </div>
        <div>
          <h3 className={`font-semibold ${titleClassName ?? "text-[#FF8C00]"}`}>{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedProductCard({ p }: { p: ProductRow & { signedImageUrl: string | null } }) {
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[1.5/1] sm:aspect-[3/2] bg-slate-100">
        {p.signedImageUrl ? (
          <img
            src={p.signedImageUrl}
            alt={p.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
        )}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            {p.category ?? "general"}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-slate-900">{p.name}</div>
            <div className="mt-1 text-sm text-slate-600 truncate">{p.size ? `Size: ${p.size}` : "Size: —"}</div>
          </div>
          <div className="shrink-0 rounded-2xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {p.priceFrom == null ? "Quote" : `$${p.priceFrom}`}
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
          {p.description ?? "Tap to view details and request a quote."}
        </p>
      </div>
    </Link>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function HeroSliderSkeleton() {
  return (
    // Exact same dimensions as HeroSlider — zero layout shift on swap
    <div className="relative w-full overflow-hidden rounded-3xl bg-slate-200 aspect-[4/3] lg:aspect-auto lg:h-[460px]">
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s ease-in-out infinite",
        }}
      />
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

function FeaturedProductsSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm">
          <div className="aspect-[3/2] bg-slate-200 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-1/2 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-full rounded-lg bg-slate-200 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Async server components — receive pre-kicked promises ─────────────────────

/**
 * KEY PATTERN: the parent kicks off DB + signing as plain Promises (no await),
 * then passes them in. Work starts at page-request time, not when React reaches
 * the Suspense boundary. The component just awaits the already-in-flight promise.
 */
async function HeroSection({ imagesPromise }: { imagesPromise: Promise<string[]> }) {
  const heroImages = await imagesPromise;
  return <HeroSlider images={heroImages} />;
}

async function FeaturedProducts({
  productsPromise,
}: {
  productsPromise: Promise<(ProductRow & { signedImageUrl: string | null })[]>;
}) {
  const featured = await productsPromise;

  if (featured.length === 0) {
    return (
      <div className="rounded-3xl border bg-white p-6 text-slate-600">
        No products available right now.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((p) => (
        <FeaturedProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}

// ── Page — kicks off ALL async work immediately, awaits nothing ───────────────

export default function Home() {
  // 🔑 Promises created synchronously at render time.
  //    Both DB queries + all Supabase signing calls fire in parallel immediately.
  //    No top-level await = the page shell (text, nav, buttons) renders instantly.

  const heroImagesPromise: Promise<string[]> = prisma.product
    .findMany({
      where: { isActive: true, stationId: 1 },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 10,
      select: { imagePath: true }, // only fetch what we need
    })
    .then((rows) =>
      Promise.all(rows.map((p) => (p.imagePath ? signProductImage(p.imagePath) : null)))
    )
    .then((urls) => urls.filter(Boolean) as string[]);

  const featuredPromise = prisma.product
    .findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
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
    <main className="relative overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">

          {/* Left — static, paints immediately */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Welcome - You've just bounced into{" "}
              <span className="inline text-[#FF8C00]">Happidoo!</span>
            </h1>
            <p className="mt-4 text-xl text-slate-600">Pick the fun, we deliver the experience!</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center rounded-2xl bg-[#FF8C00] px-5 py-3 font-semibold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
              >
                Browse the Fun
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-2xl bg-black/5 px-5 py-3 font-semibold text-slate-900 hover:bg-black/10 transition"
              >
                Request a Quote
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatPill label="Spotless After Every Use" />
              <StatPill label="Right On Time, Every Time" />
              <StatPill label="Big Smiles, Safe Fun" />
            </div>
          </div>

          {/* Right — skeleton holds exact space, slider swaps in atomically */}
          <Suspense fallback={<HeroSliderSkeleton />}>
            <HeroSection imagesPromise={heroImagesPromise} />
          </Suspense>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
              <p className="mt-1 text-slate-600">Simple process, zero stress. You pick, we do the heavy lifting.</p>
            </div>
            <Link
              href="/catalog"
              className="hidden rounded-2xl bg-black/5 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/10 transition sm:inline-flex"
            >
              Explore catalog
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <StepCard step="1" title="Choose your preferences" desc="Browse the catalog and pick the perfect equipment for your event." />
            <StepCard step="2" title="We deliver & set up" desc="On-time delivery with safe setup, anchoring, and quick inspection." />
            <StepCard step="3" title="Bounce → we pick up" desc="Enjoy your event. After the party, we return for fast pickup." />
          </div>
        </div>
      </section>

      {/* ── Popular rentals ── */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Popular rentals</h2>
            <p className="mt-1 text-slate-600">Popular picks right now — delivery, setup, and pickup included.</p>
          </div>
          <Suspense fallback={<FeaturedProductsSkeleton />}>
            <FeaturedProducts productsPromise={featuredPromise} />
          </Suspense>
          <div className="mt-7 flex justify-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white shadow-sm hover:opacity-95 active:scale-[0.98] transition"
            >
              View full catalog
            </Link>
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* ── CTA ── */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-8 text-center shadow-sm backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-900">Ready to book an unforgettable event?</h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600">
              Browse inflatables, request a quote, and we'll handle the delivery and setup.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center rounded-2xl bg-[#FF8C00] px-6 py-3 font-semibold text-white shadow-lg hover:scale-[1.01] active:scale-[0.98] transition"
              >
                Browse the Fun
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-2xl bg-black/5 px-6 py-3 font-semibold text-slate-900 hover:bg-black/10 transition"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}