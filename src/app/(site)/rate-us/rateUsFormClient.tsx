"use client";

import { useMemo, useState } from "react";

type ApiResp = { ok: true } | { error: string; issues?: any };

export default function RateUsForm() {
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  // honeypot (hidden)
  const [website, setWebsite] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => rating >= 1 && rating <= 5, [rating]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          message,
          name,
          city,
          website, // honeypot
        }),
      });

      // 204 from honeypot = pretend success
      if (res.status === 204) {
        setDone(true);
        return;
      }

      const data = (await res.json()) as ApiResp;

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Something went wrong");
        return;
      }

      setDone(true);
      setMessage("");
      setName("");
      setCity("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="text-4xl">🎉</div>
        <h2 className="mt-3 text-xl font-bold">Thanks!</h2>
        <p className="mt-2 text-slate-600">
          Your rating was sent. If you left a testimonial, it will appear after approval.
        </p>

        <button
          className="mt-5 rounded-2xl bg-[#FF8C00] px-5 py-2 text-sm font-semibold text-white hover:opacity-95"
          onClick={() => setDone(false)}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot - keep it hidden */}
      <div className="hidden">
        <label className="text-sm">Website</label>
        <input value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Rating</label>

        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={[
                "h-10 w-10 rounded-xl border text-lg",
                n <= rating ? "bg-yellow-50 border-yellow-300" : "bg-white border-slate-200",
              ].join(" ")}
              aria-label={`${n} star`}
            >
              ⭐
            </button>
          ))}
          <span className="ml-2 text-sm text-slate-600">{rating}/5</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Testimonial 
        </label>
        <textarea
          className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-300"
          rows={4}
          placeholder="Tell us how it went (10+ characters if you write something)."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">Tip: short and specific is gold.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Name </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">City </label>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-300"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Beirut, Tripoli, ..."
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        disabled={submitting}
        className="w-full rounded-2xl bg-[#FF8C00] px-5 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Submit"}
      </button>

      {/* <p className="text-center text-xs text-slate-500">
        Testimonials show publicly only after approval.
      </p> */}
    </form>
  );
}
