"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// ── helper (same as ProductCard) ─────────────────────────────────────────────
function getOptimizedImageUrl(url: string, width: number) {
  return (
    url.replace("/object/public/", "/render/image/public/") +
    `?width=${width}&format=webp&quality=80`
  );
}

// ── HeroSlider ────────────────────────────────────────────────────────────────
type HeroSliderProps = { images: string[] };

export default function HeroSlider({ images }: HeroSliderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (!images.length) {
    return (
      <div className="relative min-h-[360px] grid place-items-center rounded-3xl border border-dashed border-black/20 bg-white/50">
        <span className="text-sm text-slate-500">
          No hero images found for station 1
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[1.5/1] sm:aspect-[3/2] bg-slate-100 overflow-hidden rounded-3xl shadow-xl">
      {images.map((src, i) => (
        <Image
          key={i}
          src={getOptimizedImageUrl(src, 1200)}
          alt={`Hero slide ${i + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 80vw"
          className={`object-cover transition-opacity duration-200 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          priority={i === 0}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── ProductSlider types ───────────────────────────────────────────────────────
type Product = {
  id: string | number;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  size: string | null;
  priceFrom: number | null;
  signedImageUrl: string | null;
};

type ProductSliderProps = { products: Product[] };

// ── ProductCard ───────────────────────────────────────────────────────────────
function ProductCard({ p }: { p: Product }) {
  const optimizedSrc = p.signedImageUrl
    ? getOptimizedImageUrl(p.signedImageUrl, 800)
    : null;

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group block overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition h-full"
    >
      <div className="relative aspect-[3/2] bg-slate-100">
        {optimizedSrc ? (
          <Image
            src={optimizedSrc}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
            {p.category ?? "general"}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-slate-900 group-hover:text-[#FF8C00] transition-colors">
              {p.name}
            </div>
            <div className="mt-1 text-sm text-slate-600 truncate">
              {p.size ? `Size: ${p.size}` : "Size: —"}
            </div>
          </div>
          <div className="shrink-0 rounded-2xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {p.priceFrom == null ? "Quote" : `$${p.priceFrom}`}
          </div>
        </div>
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">
          {p.description ?? "Tap to view details and request a quote."}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">View details</span>
          <span className="text-sm font-semibold text-slate-900 group-hover:translate-x-0.5 transition-transform">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── ProductSlider — unchanged logic ──────────────────────────────────────────
export function ProductSlider({ products }: ProductSliderProps) {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const count = products.length;

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(query.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  const stepSize = isDesktop ? 3 : 1;
  const visibleCount = isDesktop ? 3 : 1;

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => go(stepSize), 4000);
    return () => clearInterval(id);
  }, [count, step, stepSize]);

  function go(dir: number) {
    if (fading) return;
    setFading(true);
    setTimeout(() => {
      setStep((s) => (s + dir + count) % count);
      setFading(false);
    }, 300);
  }

  if (!count) return null;

  const visible = Array.from({ length: visibleCount }).map((_, i) =>
    products[(i + step) % count]
  );

  return (
    <div className="relative">
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {visible.map((p, i) => (
          <ProductCard key={`${step}-${i}`} p={p} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={() => go(-stepSize)}
          className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-slate-700 hover:bg-slate-50 transition text-sm shadow-sm"
          aria-label="Previous"
        >
          ←
        </button>
        <button
          onClick={() => go(stepSize)}
          className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white text-slate-700 hover:bg-slate-50 transition text-sm shadow-sm"
          aria-label="Next"
        >
          →
        </button>
      </div>
    </div>
  );
}