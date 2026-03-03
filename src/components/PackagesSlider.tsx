'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

const packages = [
  {
    count: '3-4',
    label: 'Inflatables',
    discount: '10%',
    description: 'Perfect for smaller parties and backyard events',
    href: '/quote?package=3',
    popular: false,
  },
  {
    count: '5',
    label: 'Inflatables',
    discount: '15%',
    description: 'Best value for birthday parties and school events',
    href: '/quote?package=4',
    popular: true,
  },
  {
    count: '6+',
    label: 'Inflatables',
    discount: '20%',
    description: 'Ideal for festivals, large events, and fundraisers',
    href: '/quote?package=6',
    popular: false,
  },
];

export default function PackageSlider() {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at middle (most popular)
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px) to trigger slide change
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < packages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="mt-10">
      {/* Desktop Grid - hidden on mobile */}
      <div className="hidden md:grid gap-6 md:grid-cols-3">
        {packages.map((pkg, index) => (
          <PackageCard key={index} {...pkg} />
        ))}
      </div>

      {/* Mobile Slider */}
      <div className="md:hidden relative">
        <div
          ref={sliderRef}
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {packages.map((pkg, index) => (
              <div key={index} className="w-full flex-shrink-0 px-4">
                <PackageCard {...pkg} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="mt-6 flex justify-center gap-2">
          {packages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-[#FF8C00]'
                  : 'w-2 bg-slate-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation arrows (optional, for extra clarity) */}
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
              currentIndex === 0
                ? 'border-slate-200 text-slate-300'
                : 'border-slate-300 text-slate-700 hover:border-[#FF8C00] hover:text-[#FF8C00]'
            }`}
            aria-label="Previous package"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => currentIndex < packages.length - 1 && setCurrentIndex(currentIndex + 1)}
            disabled={currentIndex === packages.length - 1}
            className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
              currentIndex === packages.length - 1
                ? 'border-slate-200 text-slate-300'
                : 'border-slate-300 text-slate-700 hover:border-[#FF8C00] hover:text-[#FF8C00]'
            }`}
            aria-label="Next package"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function PackageCard({
  count,
  label,
  discount,
  description,
  href,
  popular,
}: {
  count: string;
  label: string;
  discount: string;
  description: string;
  href: string;
  popular: boolean;
}) {
  if (popular) {
    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-[#FF8C00] bg-gradient-to-br from-[#FF8C00] to-orange-600 p-6 shadow-2xl transition hover:scale-[1.02]">
        {/* Most Popular Badge */}
        <div className="absolute -right-10 top-8 rotate-45 bg-white px-10 py-1.5 text-xs font-black uppercase tracking-wider text-[#FF8C00] shadow-md">
          Most Popular
        </div>

        <div className="text-center">
          <div className="text-5xl font-black text-white">{count}</div>
          <div className="mt-1 text-sm font-semibold uppercase tracking-wide text-white/90">
            {label}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="text-5xl font-black text-white">{discount}</div>
          <div className="text-lg font-bold text-white/90">OFF</div>
        </div>

        <p className="mt-4 text-center text-sm font-medium text-white/90">
          {description}
        </p>

        <Link
          href={href}
          className="mt-6 block w-full rounded-2xl bg-white px-4 py-3 text-center font-bold text-[#FF8C00] transition hover:bg-slate-50 shadow-lg"
        >
          Get Quote
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-lg transition hover:shadow-xl">
      <div className="text-center">
        <div className="text-5xl font-black text-slate-900">{count}</div>
        <div className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        <div className="text-4xl font-black text-[#FF8C00]">{discount}</div>
        <div className="text-lg font-bold text-slate-600">OFF</div>
      </div>

      <p className="mt-4 text-center text-sm text-slate-600">{description}</p>

      <Link
        href={href}
        className="mt-6 block w-full rounded-2xl bg-slate-100 px-4 py-3 text-center font-bold text-slate-900 transition hover:bg-slate-200"
      >
        Get Quote
      </Link>
    </div>
  );
}