// src/app/(site)/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Happidoo",
  description:
    "Terms and conditions for Happidoo inflatable rentals: booking, delivery, payments, safety, and liability.",
};

type Section = {
  n: number;
  title: string;
  bullets: string[];
};

const SECTIONS: Section[] = [
  {
    n: 1,
    title: "Booking and Confirmation",
    bullets: [
      "Bookings can be made via WhatsApp or our website’s quote request form.",
      "A booking is only confirmed once you receive a confirmation from us.",
      "Please provide your event date, location, and selected inflatables at the time of booking.",
    ],
  },
  {
    n: 2,
    title: "Rental Duration",
    bullets: [
      "Pricing is based on a one-day rental.",
      "If you require the inflatable for more than one day, please inform us so we can prepare an adjusted quotation.",
    ],
  },
  {
    n: 3,
    title: "Delivery, Setup, and Takedown",
    bullets: [
      "We handle delivery, setup, and pick-up of the inflatables.",
      "Setup includes securely anchoring the inflatable and testing it for safe use.",
      "Setup and takedown times vary depending on the number and size of inflatables.",
    ],
  },
  {
    n: 4,
    title: "Location Requirements",
    bullets: [
      "The location must have a flat area with enough space around the inflatable and access to a power source.",
      "If using indoors, ceiling height and floor space must be sufficient, and the surface must be suitable.",
    ],
  },
  {
    n: 5,
    title: "Supervision and Usage",
    bullets: [
      "Adult supervision is recommended to ensure safety. Adults should not get on the inflatables, as this reduces the maximum number of children who can safely use them.",
      "The maximum number of users depends on the inflatable. We will provide this information when confirming your booking.",
      "Having staff present to supervise the inflatable is optional; clients may choose to supervise themselves or request our staff.",
    ],
  },
  {
    n: 6,
    title: "Weather Policy",
    bullets: [
      "High winds, heavy rain, or other unsafe conditions may result in cancellation or rescheduling. Safety is our priority.",
      "We will coordinate with you ahead of time if weather conditions are risky.",
    ],
  },
  {
    n: 7,
    title: "Payments and Deposit",
    bullets: [
      "A deposit of 30% of the total rental cost is required to confirm your booking.",
      "The deposit is non-refundable in case of cancellation, except for circumstances covered under our weather or rescheduling policy.",
      "The remaining balance must be paid after the setup of the inflatables and before we leave the location.",
      "Accepted payment methods include: Wish Money, OMT, BOB, and bank transfer.",
      "Full payment may be required in some cases to secure the booking, as indicated at the time of reservation.",
    ],
  },
  {
    n: 8,
    title: "Cancellations and Rescheduling",
    bullets: [
      "Cancellations must be communicated as soon as possible.",
      "Deposits are non-refundable unless the cancellation is due to unsafe weather conditions or other circumstances approved by us.",
      "Rescheduling is allowed depending on availability. Any changes to date, location, or inflatables must be confirmed with us in advance.",
    ],
  },
  {
    n: 9,
    title: "Safety and Responsibility",
    bullets: [
      "Clients are responsible for damage caused by misuse or negligence. Normal wear and tear is covered by us.",
      "Inflatables are cleaned and sanitized after setup as part of our standard process.",
    ],
  },
  {
    n: 10,
    title: "Liability",
    bullets: [
      "We are not liable for injuries caused by misuse, failure to follow safety instructions, or conditions outside our control (e.g., weather).",
      "By booking, clients agree to follow all safety guidelines provided by us.",
    ],
  },
  {
    n: 11,
    title: "Additional Notes",
    bullets: [
      "Any changes to the booking (date, location, inflatables) must be communicated in advance.",
      "Our staff may refuse setup if the location is unsafe or does not meet the requirements above.",
    ],
  },
];

export default function TermsPage() {
  const lastUpdated = "February 5, 2026";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
          Terms & Conditions
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Happidoo Rental Terms
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
          Clear guidelines so your event stays fun, safe, and stress-free.
        </p>

        <p className="mt-3 text-xs text-slate-500">
          Last updated: <span className="font-semibold text-slate-700">{lastUpdated}</span>
        </p>
      </header>

      {/* Sections grid */}
      <div className="grid gap-4">
        {SECTIONS.map((s) => (
          <section
            key={s.n}
            className="rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-900 text-sm font-extrabold text-white">
                {s.n}
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                  {s.title}
                </h2>

                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-700">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-10 rounded-3xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-700 shadow-sm backdrop-blur">
        <div className="text-base font-extrabold text-slate-900">
          Questions?
        </div>
        <p className="mt-1">
          Contact us via WhatsApp or submit a request on the{" "}
          <Link
            href="/quote"
            className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700"
          >
            Quote page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
