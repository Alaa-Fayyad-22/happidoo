import { headers } from "next/headers";
import TestimonialsSlider from "./TestimonialsSlider";

type Item = {
  id: string;
  rating: number;
  message: string | null;
  name: string | null;
  city: string | null;
};

async function getBaseUrlFromHeaders() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return null;
  return `${proto}://${host}`;
}

async function getTestimonials(): Promise<Item[]> {
  const base = await getBaseUrlFromHeaders();
  if (!base) return [];

  const res = await fetch(`${base}/api/testimonials?limit=10`, {
    cache: "no-store",
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

export default async function TestimonialsSection() {
  const items = await getTestimonials();
  if (items.length === 0) return null;

  return (
  <section className="mx-auto max-w-6xl px-4 py-14">
  <div className="text-center">
    <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
      What parents say
    </h2>
    <p className="mt-2 text-slate-600">Real words from real events</p>
  </div>

  <div className="mt-10">
    <TestimonialsSlider items={items} />
  </div>
</section>



  );
}
