// src/app/(site)/faq/page.tsx
import { FAQ } from "@/lib/faq";
import Link from "next/link";

export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about inflatable rentals, delivery, setup, and safety.",
};

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          FAQ
        </h1>
        <p className="mt-2 text-slate-600">
          Quick answers about booking, delivery, setup, and safety.
        </p>
      </header>

      <section className="space-y-3">
        {FAQ.map((item, idx) => (
          <details
            key={idx}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <summary className="cursor-pointer list-none select-none">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-medium text-slate-900 leading-tight">
                  {item.q}
                </h2>

                <span
                  className="
                    flex h-6 w-6 shrink-0 items-center justify-center
                    transition-transform duration-200
                    group-open:rotate-180
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </summary>


            <div className="pt-3 text-sm leading-6 text-slate-600">
              {item.a}
            </div>

            {!!item.tags?.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </details>
        ))}
      </section>

      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm text-slate-700">
          Still have questions? Send a request from the 
          <Link
    href="/quote"
    className="rounded-xl px-1.5 text-sm font-small hover:underline"
  >
    Quote 
  </Link>page and we’ll reply fast.
        </p>
      </div>
    </main>
  );
}



