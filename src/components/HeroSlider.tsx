"use client";

import { useEffect, useState } from "react";

type HeroSliderProps = {
  images: string[];
};

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
        <img
          key={i}
          src={src}
          alt={`Hero slide ${i + 1}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
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
