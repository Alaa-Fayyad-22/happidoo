// src/app/(site)/quote/quoteFormClient.tsx
"use client";

import { useMemo, useState } from "react";

type Props = {
  productSlug: string | null;
  productName: string | null;
};

type QuotePayload = {
  productSlug: string | null;
  eventDate: string;
  timeWindow: "Morning" | "Afternoon" | "Evening";
  city: string;
  address: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  website: string; // honeypot
};

function todayYmd() {
  // Local date => YYYY-MM-DD
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function postQuote(payload: QuotePayload) {
  const res = await fetch("/api/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data?.ok) {
    const issues = Array.isArray(data?.issues) ? data.issues : [];
    const msg =
      issues.length > 0
        ? issues
            .map((it: any) => `${(it.path || []).join(".")}: ${it.message}`)
            .join("\n")
        : data?.message || `Quote failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export default function QuoteFormClient({ productSlug, productName }: Props) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

   const today = useMemo(() => todayYmd(), []);

  const [form, setForm] = useState<QuotePayload>({
    productSlug: productSlug ?? null,
    eventDate: today,
    timeWindow: "Morning",
    city: "",
    address: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
    website: "",
  });

  async function submit() {
    setError("");
    setBusy(true);

    try {
      if (!form.eventDate.trim()) throw new Error("Event date is required.");
      if (!form.city.trim()) throw new Error("City is required.");
      if (!form.address.trim()) throw new Error("Address is required.");
      if (!form.name.trim()) throw new Error("Name is required.");
      if (!form.phone.trim()) throw new Error("Phone is required.");
      if (!form.email.trim()) throw new Error("Email is required.");

      await postQuote(form);
      setDone(true);
    } catch (e: any) {
      setError(e?.message || "Failed to submit quote");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
    {/* ONE glass card */}
    <div className="rounded-3xl border border-white/60 /45 backdrop-blur-xl shadow-2xl shadow-black/10 p-6 md:p-8">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/60 /40 px-3 py-1 text-xs font-semibold text-slate-800">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Fast response
        </div>

        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Request a Quote</h1>
        <p className="mt-2 text-slate-600">
          Tell us about your event. We’ll confirm availability and final pricing.
        </p>
        <div className="mt-3 text-xs text-slate-500">
            Request date: <span className="font-semibold text-slate-700">{form.eventDate}</span>
          </div>
      </div>

      {form.productSlug && (
        <div className="mb-4 rounded-3xl border  p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Selected product</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {productName || form.productSlug}
          </div>
          <div className="mt-1 text-sm text-slate-600">This will be attached to your quote.</div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {done ? (
        <div className="rounded-3xl"
>
          <div className="text-xl font-bold">Quote submitted ✅</div>
          <div className="mt-2 text-slate-600">
            We received your request and will contact you soon.
          </div>
        </div>
      ) : (
        <div className="rounded-3xl "
>
          {/* honeypot */}
          <input
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* <Field label="Event date *">
              <input
                type="date"
                value={form.eventDate}
                onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
                className="w-full rounded-2xl border  px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                disabled={busy}
              />
            </Field> */}

            <Field label="Time window *">
              <select
                value={form.timeWindow}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    timeWindow: e.target.value as QuotePayload["timeWindow"],
                  }))
                }
                className="w-full rounded-2xl border  px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                disabled={busy}
              >
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </Field>

            <Field label="City *">
              <input
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                className="w-full rounded-2xl border  px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                placeholder="e.g. Beirut"
                disabled={busy}
              />
            </Field>

            <Field label="Phone *">
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-2xl border  px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                placeholder="+961..."
                disabled={busy}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Address / delivery notes *">
              <input
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="w-full rounded-2xl border  px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                placeholder="Street, building, gate info..."
                disabled={busy}
              />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name *">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-2xl border  px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                disabled={busy}
              />
            </Field>

            <Field label="Email *">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-2xl border  px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                disabled={busy}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Notes (optional)">
              <textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full rounded-2xl border  px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                rows={4}
                placeholder="Kids age, event type, special requests..."
                disabled={busy}
              />
            </Field>
          </div>

          <button
            onClick={submit}
            disabled={busy}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit quote"}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">
            By submitting, you agree we can contact you about your request.
          </p>
        </div>
      )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {children}
    </label>
  );
}
