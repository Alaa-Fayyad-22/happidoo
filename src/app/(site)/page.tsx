import Link from "next/link";
import TestimonialsSection from "@/components/TestimonialsSection";


const CATS = [
  { title: "Bouncers", desc: "Perfect for birthdays and small parties." },
  { title: "Slides", desc: "Big fun, big energy, big photos." },
  { title: "Obstacle Courses", desc: "For schools, festivals, and competitions." },
];

const TRUST = [
  { title: "Safe setup", desc: "Delivery, install, and pickup handled by our team." },
  { title: "Clean equipment", desc: "Inspected and cleaned before every event." },
  { title: "Fast response", desc: "We reply quickly with availability and pricing." },
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 md:px-8 pt-10 md:pt-14 pb-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Delivery + setup included
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
              Make your event unforgettable.
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Slides, bouncers, and obstacle courses for birthdays, schools, and festivals.
              Clean gear. Safe setup. Quick quotes.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold border bg-white hover:bg-slate-50 transition"
              >
                Browse Catalog
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
              >
                Get a Quote
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3">
              <Stat k="100+" v="Events" />
              <Stat k="9am–9pm" v="Availability" />
              <Stat k="Fast" v="Response" />
            </div>
          </div>

          {/* Hero Card */}
          <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur shadow-xl shadow-black/5"
>
            <div className="p-6">
              <div className="text-sm font-semibold text-slate-900">Popular picks</div>
              <p className="mt-1 text-sm text-slate-600">
                Browse the catalog and request a quote in under 60 seconds.
              </p>
            </div>
            <div className="border-t bg-slate-50 p-6 grid gap-3">
              <HeroRow label="✅ Delivery + setup" />
              <HeroRow label="✅ Cleaned & inspected" />
              <HeroRow label="✅ Great for kids & families" />
            </div>
            <div className="p-6">
              <Link
                href="/catalog"
                className="w-full inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition"
              >
                See Catalog
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 md:px-8 pb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Categories</h2>
            <p className="mt-1 text-slate-600">Choose the vibe. We handle the rest.</p>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-slate-900 hover:underline">
            View all →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {CATS.map((c) => (
            <div key={c.title} className="rounded-3xl border bg-white p-6 shadow-sm">
              <div className="text-lg font-bold">{c.title}</div>
              <p className="mt-2 text-sm text-slate-600">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 md:px-8 pb-14">
        <div className="rounded-3xl border bg-white shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight">Why people choose us</h2>
          <p className="mt-2 text-slate-600">
            We focus on safety, cleanliness, and fast communication.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {TRUST.map((t) => (
              <div key={t.title} className="rounded-3xl border bg-slate-50 p-5">
                <div className="font-bold text-slate-900">{t.title}</div>
                <div className="mt-2 text-sm text-slate-600">{t.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition"
            >
              Get a Quote
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-3 font-semibold hover:bg-slate-50 transition"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 text-center shadow-sm">
      <div className="text-xl font-extrabold">{k}</div>
      <div className="text-xs text-slate-600">{v}</div>
    </div>
  );
}

function HeroRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm font-semibold text-slate-800">
      {label}
    </div>
  );
}
