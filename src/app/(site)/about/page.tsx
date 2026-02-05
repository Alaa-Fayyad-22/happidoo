// src/app/(site)/about/page.tsx
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description:
    "A Lebanese inflatable rental team providing safe, clean, and reliable setups for events across Lebanon.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      {/* Hero / Who we are */}
      <section className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur sm:p-10">
        <div className="max-w-3xl">
          <p className="text-lg font-bold text-[#00A0E9]">About Us</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            A Lebanese team bringing fun to events, the right way.
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-700">
           Happidoo is a Lebanese inflatable rental team bringing fun, safety, and reliability to events across Lebanon. 
           From backyard birthdays to school events, we handle the setup so families can actually enjoy the day.
            <br />
            We focus on safety, cleanliness, and reliable service — so parents can relax while kids enjoy the fun.
          </p>

          {/* Soft CTA (optional, not dominant) */}
          <div className="mt-6">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-2xl bg-[#FF8C00] px-5 py-3 font-semibold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
 >
              Browse inflatables
            </Link>
          </div>
        </div>
      </section>

      {/* Why people choose us */}
      <section className="mt-10 sm:mt-12">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Why people rent from us
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="We understand local events"
            desc="We know how events work in Lebanon — locations vary, timing matters, and flexibility is important."
          />
          <Card
            title="Safety is non-negotiable"
            desc="Every inflatable is anchored properly and set up with care. We don’t rush and we don’t cut corners."
          />
          <Card
            title="Clean equipment"
            desc="Units are inspected and cleaned regularly so they arrive ready for kids and families."
          />
          <Card
            title="Clear communication"
            desc="You know what’s included, when we arrive, and what to expect — no confusion."
          />
          <Card
            title="On-time delivery"
            desc="We plan ahead and respect your schedule, especially on busy event days."
          />
          <Card
            title="Trusted by families & schools"
            desc="Many of our bookings come from recommendations — that trust matters to us."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="mt-10 rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur sm:mt-12 sm:p-10">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          How it works
        </h2>

        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          <Step
            n="1"
            title="Choose your inflatables"
            desc="Pick one or more items from our catalog based on your space and event."
          />
          <Step
            n="2"
            title="Send a quote request"
            desc="Share the date, location, and time window. We confirm availability and details."
          />
          <Step
            n="3"
            title="We deliver & set up"
            desc="We arrive, set up safely, and handle pickup so you can enjoy the event."
          />
        </ol>
      </section>

      {/* Strong CTA at the end */}
      <section className="mt-10 sm:mt-12 ">
        <div className="rounded-3xl border bg-[#FF8C00] p-8 text-white sm:p-10 inline-flex items-center justify-center flex-col text-center w-full">
          <h2 className="text-2xl font-bold">
            Planning an event?
          </h2>
          <p className="mt-3 max-w-2xl text-m text-slate-200">
            Send us a quote request with your event details and we’ll get back to
            you with availability, pricing, and next steps.
          </p>

          <div className="mt-6 inline-flex items-center justify-center ">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-2xl text-align-center bg-white px-6 py-3 text-m font-semibold text-slate-900 hover:bg-slate-100"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{desc}</p>
    </div>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <li className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
          {n}
        </div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{desc}</p>
    </li>
  );
}
