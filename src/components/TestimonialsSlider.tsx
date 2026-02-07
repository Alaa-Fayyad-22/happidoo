"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Item = {
  id: string;
  rating: number;
  message: string | null;
  name: string | null;
  city: string | null;
};

function initials(name?: string | null) {
  const s = (name ?? "").trim();
  if (!s) return "🎈";
  const parts = s.split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0]?.toUpperCase() ?? "";
  const b = parts[1]?.[0]?.toUpperCase() ?? "";
  return (a + b) || a || "🎈";
}

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < n ? "text-[#FF8C00]" : "text-slate-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function TestimonialsSlider({ items }: { items: Item[] }) {
  const realCount = items.length;

  const slides = useMemo(() => {
    if (realCount <= 1) return items;
    return [items[realCount - 1], ...items, items[0]];
  }, [items, realCount]);

  const [index, setIndex] = useState(realCount <= 1 ? 0 : 1);
  const [animating, setAnimating] = useState(true);

  // swipe
  const startX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const SWIPE_MIN_PX = 60;

  const next = () => {
    if (realCount <= 1) return;
    setAnimating(true);
    setIndex((i) => i + 1);
  };

  const prev = () => {
    if (realCount <= 1) return;
    setAnimating(true);
    setIndex((i) => i - 1);
  };

  // auto
  useEffect(() => {
    if (realCount <= 1) return;
    const id = setInterval(next, 7500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realCount]);

  function onTransitionEnd() {
    if (realCount <= 1) return;

    if (index === slides.length - 1) {
      setAnimating(false);
      setIndex(1);
      return;
    }
    if (index === 0) {
      setAnimating(false);
      setIndex(slides.length - 2);
      return;
    }
  }

  useEffect(() => {
    if (!animating) {
      const id = requestAnimationFrame(() => setAnimating(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animating]);

  function onTouchStart(e: React.TouchEvent) {
    if (realCount <= 1) return;
    startX.current = e.touches[0].clientX;
    setDragX(0);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    setDragX(dx);
    if (Math.abs(dx) > 8) e.preventDefault();
  }

  function onTouchEnd() {
    if (startX.current == null) return;
    const dx = dragX;
    startX.current = null;
    setDragX(0);

    if (dx <= -SWIPE_MIN_PX) next();
    else if (dx >= SWIPE_MIN_PX) prev();
  }

  const trackStyle: React.CSSProperties = {
    transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
    transition: animating ? "transform 520ms cubic-bezier(.22,.61,.36,1)" : "none",
  };

  return (
    <div className="relative mx-auto max-w-5xl">
      {/* slider frame */}
      <div
        className="relative overflow-hidden rounded-[32px]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y" }}
      >
        <div className="flex" style={trackStyle} onTransitionEnd={onTransitionEnd}>
          {slides.map((t, i) => (
            <div key={`${t.id}-${i}`} className="w-full shrink-0 px-4 sm:px-10 py-8 sm:py-10">
              {/* The capsule */}
              <div className="relative rounded-[28px] border border-white/50 bg-white/65 backdrop-blur px-6 py-8 sm:px-10 sm:py-10 shadow-[0_18px_70px_rgba(15,23,42,0.12)]">
                {/* little accent corner */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-orange-200/45 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-sky-200/45 blur-3xl" />

                {/* top row: rating */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Stars n={t.rating} />
                    <span className="text-sm font-semibold text-slate-700">
                      {t.rating}.0
                    </span>
                  </div>

                  <span className="text-5xl font-black leading-none text-[#FF8C00]/18">
                    “
                  </span>
                </div>

                {/* quote */}
                <p className="relative mt-6 text-left text-2xl sm:text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
                  {t.message?.trim()
                    ? `“${t.message.trim()}”`
                    : "“Amazing service — the kids had the best day.”"}
                </p>

                {/* author */}
                <div className="relative mt-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-extrabold">
                    {initials(t.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {t.name?.trim() ? t.name.trim() : "Happy parent"}
                    </p>
                    <p className="text-sm font-semibold text-slate-600 truncate">
                      {t.city?.trim() ? t.city.trim() : "Happidoo customer"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* arrows: outside feel but still attached */}
        {realCount > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-sm shadow-sm ring-1 ring-white/60 backdrop-blur hover:bg-white"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-2 text-sm shadow-sm ring-1 ring-white/60 backdrop-blur hover:bg-white"
              aria-label="Next testimonial"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* remove dots: they cheapen it */}
    </div>
  );
}
