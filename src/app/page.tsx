// src/app/(site)/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

import "./globals.css";


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
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SignedUrlResp;
    return data?.url || null;
  } catch {
    return null;
  }
}


function StatPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-sm shadow-sm backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      <span className="text-slate-700">{label}</span>
    </div>
  );
}

function PlaceholderImage({
  title = "Hero Visual Placeholder",
  subtitle = "Landing images will be loaded from Postgres later.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/60 p-4 shadow-xl backdrop-blur">
      {/* Decorative background */}
      {/* <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-pink-500/25 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-yellow-400/25 blur-3xl" />
        <div className="absolute left-1/3 top-1/3 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div> */}

      {/* Placeholder content */}
      <div className="relative grid min-h-[360px] place-items-center rounded-2xl border border-dashed border-black/20 bg-white/50 p-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-black/5">
            {/* simple icon */}
            {/* <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-slate-700"
              aria-hidden="true"
            > */}
              {/* <path
                d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z"
                stroke="currentColor"
                strokeWidth="1.5"
              /> */}
              {/* <path
                d="M8 14l2-2 3 3 2-2 3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              /> */}
              {/* <path
                d="M9 9.5h.01"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              /> */}
            {/* </svg> */}
          </div>

          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

          <div className="mt-4 inline-flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-slate-700">
              TODO: fetch from Postgres
            </span>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-slate-700">
              TODO: responsive images
            </span>
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-slate-700">
              TODO: optimize & cache
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-black/5 text-sm font-bold text-slate-900">
          {step}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function FeaturedProductCard({
  p,
}: {
  p: {
    id: string;
    slug: string;
    name: string;
    category: string | null;
    size: string | null;
    priceFrom: number | null;
    signedImageUrl: string | null;
    description: string | null;
  };
}) {
  return (
    <Link
      href={`/product/${p.slug}`}
      className="group overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative h-44 bg-white/50">
        {p.signedImageUrl ? (
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

        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
          {p.description || "Tap to view details and request a quote."}
        </p>
      </div>
    </Link>
  );
}


function ProductSkeletonCard({ title }: { title: string }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/70 shadow-sm backdrop-blur">
      {/* Image placeholder */}
      <div className="relative grid h-44 place-items-center border-b border-black/10 bg-white/50">
        <div className="rounded-2xl border border-dashed border-black/20 bg-white/60 px-4 py-2 text-xs font-medium text-slate-600">
          Image placeholder (from Postgres later)
        </div>
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-pink-500/15 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-slate-700">
            From $—
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-600">
          Clean, safe, and party-ready. Details and pricing will come from your Products table.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-slate-700">Available</span>
        </div>

        <div className="mt-5 flex gap-3">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 active:scale-[0.98] transition"
          >
            View
          </Link>
          <Link
            href="/quote"
            className="inline-flex items-center justify-center rounded-2xl bg-black/5 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/10 transition"
          >
            Get Quote
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-black/10  p-5 shadow-sm backdrop-blur">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3,
  });

  const featured = await Promise.all(
    products.map(async (p: ProductRow) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      size: p.size,
      priceFrom: p.priceFrom,
      description: p.description,
      signedImageUrl: p.imagePath ? await signProductImage(p.imagePath) : null,
    }))
  );
  return (
    <main className="relative overflow-hidden">
      {/* Decorative blobs (page-level) */}
      {/* <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-pink-400/25 blur-3xl" />
        <div className="absolute top-24 -right-48 h-[560px] w-[560px] rounded-full bg-yellow-300/25 blur-3xl" />
        <div className="absolute bottom-[-280px] left-1/3 h-[620px] w-[620px] rounded-full bg-emerald-300/20 blur-3xl" />
      </div> */}

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">
          <div className="relative">

  {/* TITLE — FIRST, NO CONTENT BEFORE */}
  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
    Bounce House Rentals for
    <span className="block text-[#FF8C00]">Birthdays & Events</span>
  </h1>

  <p className="mt-4 text-lg text-slate-600">
    Pick a bouncer, slide, or obstacle course — we’ll handle delivery,
    setup, and pickup.
  </p>

  {/* CTA BUTTONS */}
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
      Get a Quote
    </Link>
  </div>

  {/* TRUST PILLS — MOVED BELOW */}
  <div className="mt-6 flex flex-wrap gap-2">
    <StatPill label="Sanitized after every use" />
    <StatPill label="On-time delivery & setup" />
    <StatPill label="Safe, family-friendly fun" />
  </div>
  {/* <div className="mt-6 rounded-3xl border border-black/10 bg-white/70 p-4 text-sm text-slate-600 shadow-sm backdrop-blur">
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Cleaned & inspected
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Setup included
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Friendly support
                </span>
              </div>
              </div> */}

</div>


          {/* Hero visual placeholder */}
          <PlaceholderImage />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
              <p className="mt-1 text-slate-600">
                Simple process, zero stress. You pick, we do the heavy lifting.
              </p>
            </div>
            <Link
              href="/catalog"
              className="hidden rounded-2xl bg-black/5 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-black/10 transition sm:inline-flex"
            >
              Explore catalog
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              step="1"
              title="Choose an inflatable"
              desc="Browse the catalog and pick the perfect bouncer, slide, or obstacle course."
            />
            <StepCard
              step="2"
              title="We deliver & set up"
              desc="On-time delivery with safe setup, anchoring, and quick inspection."
            />
            <StepCard
              step="3"
              title="Bounce → we pick up"
              desc="Enjoy your event. After the party, we return for fast pickup."
            />
          </div>
        </div>
      </section>

      {/* FEATURED (placeholders for now) */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Popular rentals</h2>
            <p className="mt-1 text-slate-600">
              Popular picks right now — delivery, setup, and pickup included.
            </p>
          </div>

          {featured.length === 0 ? (
            <div className="rounded-3xl border bg-white p-6 text-slate-600">
              No products available right now.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <FeaturedProductCard key={p.id} p={p} />
              ))}
            </div>
          )}

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

      {/* TRUST / WHY US */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-4 lg:grid-cols-3">
            <InfoCard
              title="Safety first"
              desc="Equipment is inspected before every rental and set up with proper anchoring."
            />
            <InfoCard
              title="Clean & sanitized"
              desc="We sanitize after every use so your guests can play with confidence."
            />
            <InfoCard
              title="Reliable service"
              desc="Clear communication, on-time delivery, and easy pickup."
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-8 text-center shadow-sm backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-900">
              Ready to book an unforgettable event?
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-600">
              Browse inflatables, request a quote, and we’ll handle the delivery and setup.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center rounded-2xl bg-[#FF8C00] px-6 py-3 font-semibold text-white shadow-lg hover:scale-[1.01] active:scale-[0.98] transition:smooth"
              >
                Browse Inflatables
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-2xl bg-black/5 px-6 py-3 font-semibold text-slate-900 hover:bg-black/10 transition"
              >
                Get a Quote
              </Link>
            </div>

            {/* <p className="mt-4 text-xs text-slate-500">
              (Later: we can add review stars + real testimonials here once you connect the reviews source.)
            </p> */}
          </div>
        </div>
      </section>
    </main>
  );
}
