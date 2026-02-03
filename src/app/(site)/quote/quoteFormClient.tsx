// src/app/(site)/quote/quoteFormClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type ProductOption = { slug: string; name: string };

type Props = {
  products: ProductOption[];
  initialSelectedSlugs: string[];
};

type QuotePayload = {
  productSlug: string | null; // backward compatible
  productSlugs: string[]; // new (multi)

  eventDate: string;
  timeWindow: "Morning" | "Afternoon" | "Evening";
  city: string;
  address: string;
  name: string;

  phoneCountry: string; // e.g. "LB"
  phoneCode: string; // e.g. "+961"
  phone: string; // raw user input (we will convert to E.164 before POST)
  email: string;

  notes: string;
  website: string; // honeypot
};

type QuoteResponse = {
  ok: true;
  message: string;
  leadId: string;
  quoteNo: number;
  createdAt: string;
  eventDate: string;
  timeWindow: string;
  productSlug: string | null;
  productSlugs: string[];
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  notes: string;
  status: string;
};

type Country = {
  iso2: string;
  name: string;
  code: string; // calling code like "+1"
  flag: string;
};

function todayYmd() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function digitsOnly(s: string) {
  return (s || "").replace(/[^\d]/g, "");
}

function buildE164(phoneCode: string, rawPhone: string) {
  const codeDigits = digitsOnly(phoneCode);
  const phoneDigits = digitsOnly(rawPhone);
  if (!codeDigits || !phoneDigits) return null;
  return `+${codeDigits}${phoneDigits}`;
}

function whatsappUrl(e164: string, text: string) {
  const waPhone = digitsOnly(e164);
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
}

async function fetchCountries(): Promise<Country[]> {
  const res = await fetch(
    "https://restcountries.com/v3.1/all?fields=name,cca2,idd,flag",
    { cache: "force-cache" }
  );
  const data = await res.json();

  const out: Country[] = [];
  for (const c of Array.isArray(data) ? data : []) {
    const iso2 = String(c?.cca2 ?? "").trim();
    const name = String(c?.name?.common ?? "").trim();
    const flag = String(c?.flag ?? "").trim();

    const root = String(c?.idd?.root ?? "").trim(); // e.g. "+1"
    const suffixes = Array.isArray(c?.idd?.suffixes) ? c.idd.suffixes : [];

    if (!iso2 || !name || !root) continue;

    // If multiple suffixes exist, pick the first to keep UI simple.
    // (You can later improve to choose the shortest/most common per country.)
    const suffix = suffixes.length > 0 ? String(suffixes[0] ?? "") : "";
    const code = `${root}${suffix}`.trim();

    // Must contain digits to be useful
    if (!digitsOnly(code)) continue;

    out.push({ iso2, name, code, flag });
  }

  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

async function postQuote(payload: QuotePayload): Promise<QuoteResponse> {
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

  return data as QuoteResponse;
}

export default function QuoteFormClient({ products, initialSelectedSlugs }: Props) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [doneQuoteNo, setDoneQuoteNo] = useState<number | null>(null);
  const [error, setError] = useState("");

  const today = useMemo(() => todayYmd(), []);

  // Countries
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [form, setForm] = useState<QuotePayload>(() => {
    const initial = initialSelectedSlugs ?? [];
    return {
      productSlugs: initial,
      productSlug: initial.length > 0 ? initial[0] : null,

      eventDate: "",
      timeWindow: "Morning",
      city: "",
      address: "",
      name: "",

      // Will be overwritten after countries load (defaults keep UI usable instantly)
      phoneCountry: "LB",
      phoneCode: "+961",
      phone: "",
      email: "",

      notes: "",
      website: "",
    };
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const list = await fetchCountries();
        if (!alive) return;
        setCountries(list);

        // If current selection isn't present, or if you want a better default,
        // try to infer from browser locale (e.g. "en-US" -> "US")
        const locale = (typeof navigator !== "undefined" ? navigator.language : "") || "";
        const guessIso2 = locale.split("-")[1]?.toUpperCase() || "";

        const fallback =
          list.find((c) => c.iso2 === guessIso2) ||
          list.find((c) => c.iso2 === form.phoneCountry) ||
          list.find((c) => c.iso2 === "LB") ||
          list[0];

        if (fallback) {
          setForm((p) => ({
            ...p,
            phoneCountry: fallback.iso2,
            phoneCode: fallback.code,
          }));
        }
      } catch {
        // keep defaults
      } finally {
        if (alive) setCountriesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.slug, p.name]));
    return form.productSlugs.map((slug) => ({
      slug,
      name: map.get(slug) || slug,
    }));
  }, [form.productSlugs, products]);

  async function submit() {
    setError("");
    setBusy(true);

    try {
      if (form.productSlugs.length === 0) {
        throw new Error("Please select at least one product.");
      }
      if (!form.eventDate.trim()) throw new Error("Event date is required.");
      if (!form.city.trim()) throw new Error("City is required.");
      if (!form.address.trim()) throw new Error("Address is required.");
      if (!form.name.trim()) throw new Error("Name is required.");
      if (!form.phone.trim() && !form.email.trim()) {
        throw new Error("Please provide at least a phone number or an email address.");
      }

      // Convert to E.164 before POST (so DB stores a universal format)
      const phoneE164 = form.phone.trim()
        ? buildE164(form.phoneCode, form.phone)
        : "";

      if (form.phone.trim() && !phoneE164) {
        throw new Error("Phone number looks invalid. Please choose country code and enter digits.");
      }

      const payload: QuotePayload = {
        ...form,
        phone: phoneE164 || "",
        productSlug: form.productSlugs[0] ?? null, // keep old in sync
      };

      const result = await postQuote(payload);

      setDone(true);
      setDoneQuoteNo(result.quoteNo ?? null);

      // WhatsApp confirmation to the user's number (click-to-chat)
      if (result.phone) {
        const productsText =
          selectedProducts.length > 0
            ? selectedProducts.map((p) => p.name).join(", ")
            : (result.productSlugs || []).join(", ");

        const createdLocal = new Date(result.createdAt).toLocaleString();

        const msg =
          `✅ Quote received!\n\n` +
          `Quote #: ${result.quoteNo}\n` +
          `Created: ${createdLocal}\n` +
          `Event: ${result.eventDate} (${result.timeWindow})\n` +
          `Products: ${productsText}\n\n` +
          `We’ll contact you soon. Please keep this quote number for reference.`;

        window.location.href = whatsappUrl(result.phone, msg);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to submit quote");
    } finally {
      setBusy(false);
    }
  }

  const previewE164 = useMemo(() => {
    if (!form.phone.trim()) return "";
    const e164 = buildE164(form.phoneCode, form.phone);
    return e164 || "";
  }, [form.phone, form.phoneCode]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-black/10 p-6 md:p-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/60 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Fast response
          </div>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Request a Quote
          </h1>
          <p className="mt-2 text-slate-600">
            Tell us about your event. We’ll confirm availability and final pricing.
          </p>
          <div className="mt-3 text-xs text-slate-500">
            Selected date:{" "}
            <span className="font-semibold text-slate-700">{form.eventDate}</span>
          </div>
        </div>

        {form.productSlugs.length > 0 && (
          <div className="mb-4 rounded-3xl border p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Selected products</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedProducts.map((p) => (
                <span
                  key={p.slug}
                  className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-800"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-wrap">
            {error}
          </div>
        )}

        {done ? (
          <div className="rounded-3xl">
            <div className="text-xl font-bold">Quote submitted ✅</div>
            <div className="mt-2 text-slate-600">
              We received your request and will contact you soon.
              {doneQuoteNo != null && (
                <>
                  {" "}
                  Your quote number is{" "}
                  <span className="font-semibold text-slate-900">{doneQuoteNo}</span>.
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl">
            {/* honeypot */}
            <input
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            {/* PRODUCT PICKER (POPUP) */}
            <div className="mb-6">
              <ProductPicker
                products={products}
                value={form.productSlugs}
                disabled={busy}
                onChange={(next) =>
                  setForm((p) => ({
                    ...p,
                    productSlugs: next,
                    productSlug: next[0] ?? null,
                  }))
                }
              />
            </div>

            {/* CONTACT INFO */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name *">
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                  disabled={busy}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                  disabled={busy}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Phone">
                  <div className="flex gap-2">
                    <select
                      value={form.phoneCountry}
                      disabled={busy || countriesLoading || countries.length === 0}
                      onChange={(e) => {
                        const iso2 = e.target.value;
                        const c = countries.find((x) => x.iso2 === iso2);
                        if (!c) return;
                        setForm((p) => ({
                          ...p,
                          phoneCountry: c.iso2,
                          phoneCode: c.code,
                        }));
                      }}
                      className="w-[58%] rounded-2xl border px-3 py-3 text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                      aria-label="Country calling code"
                    >
                      {countriesLoading ? (
                        <option>Loading countries…</option>
                      ) : countries.length === 0 ? (
                        <option>Countries unavailable</option>
                      ) : (
                        countries.map((c) => (
                          <option key={c.iso2} value={c.iso2}>
                            {c.flag ? `${c.flag} ` : ""}
                            {c.name} ({c.code})
                          </option>
                        ))
                      )}
                    </select>

                    <input
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                      placeholder="Phone number"
                      disabled={busy}
                      inputMode="tel"
                    />
                  </div>

                  {previewE164 && (
                    <div className="mt-1 text-xs text-slate-500">
                      WhatsApp will use:{" "}
                      <span className="font-semibold text-slate-700">{previewE164}</span>
                    </div>
                  )}
                </Field>

                <p className="mt-1 text-xs text-slate-500">
                  Please provide at least a phone number or an email address.
                </p>
              </div>
            </div>

            {/* EVENT DETAILS */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Event date *">
                <input
                  type="date"
                  value={form.eventDate}
                  min={today}
                  onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
                  className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                  disabled={busy}
                />
              </Field>

              <Field label="Time window *">
                <select
                  value={form.timeWindow}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      timeWindow: e.target.value as QuotePayload["timeWindow"],
                    }))
                  }
                  className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                  disabled={busy}
                >
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                </select>
              </Field>
            </div>

            {/* LOCATION */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="City *">
                <input
                  value={form.city}
                  onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                  placeholder="e.g. Beirut"
                  disabled={busy}
                />
              </Field>

              <Field label="Address / delivery notes *">
                <input
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                  placeholder="Street, building, gate info..."
                  disabled={busy}
                />
              </Field>
            </div>

            {/* NOTES */}
            <div className="mt-6">
              <Field label="Notes (optional)">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full rounded-2xl border px-4 py-3 focus:ring-2 focus:ring-slate-200 outline-none"
                  rows={4}
                  placeholder="Kids age, event type, special requests..."
                  disabled={busy}
                />
              </Field>
            </div>

            {/* SUBMIT */}
            <button
              onClick={submit}
              disabled={busy}
              className="mt-8 w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
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

function ProductPicker({
  products,
  value,
  onChange,
  disabled,
}: {
  products: { slug: string; name: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => `${p.name} ${p.slug}`.toLowerCase().includes(query));
  }, [products, q]);

  function toggle(slug: string) {
    const next = new Set(selectedSet);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange(Array.from(next));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <>
      <div className="rounded-3xl border p-5 shadow-sm bg-white/70 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Products *</div>
            <div className="mt-1 text-xs text-slate-600">
              Select one or more products for this quote.
            </div>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Select products
          </button>
        </div>

        {value.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {value.map((slug) => {
              const p = products.find((x) => x.slug === slug);
              return (
                <span
                  key={slug}
                  className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-slate-800"
                  title={slug}
                >
                  {p?.name ?? slug}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => toggle(slug)}
                    className="rounded-full px-2 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            No products selected yet.
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-slate-500">{value.length} selected</div>
          {value.length > 0 && (
            <button
              type="button"
              disabled={disabled}
              onClick={clearAll}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 disabled:opacity-50"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="mx-auto mt-10 w-[92vw] max-w-2xl rounded-3xl border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <div className="text-base font-bold text-slate-900">Select products</div>
                <div className="text-xs text-slate-600">
                  Pick one or more items for this quote.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Done
              </button>
            </div>

            <div className="px-5 py-4">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                autoFocus
              />

              <div className="mt-4 max-h-[55vh] overflow-auto rounded-2xl border">
                {filtered.length === 0 ? (
                  <div className="p-4 text-sm text-slate-600">
                    No products match your search.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {filtered.map((p) => {
                      const checked = selectedSet.has(p.slug);
                      return (
                        <li key={p.slug} className="px-4 py-3">
                          <label className="flex cursor-pointer items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(p.slug)}
                              className="h-4 w-4"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900">
                                {p.name}
                              </div>
                              <div className="text-xs text-slate-500">{p.slug}</div>
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">{value.length} selected</div>
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-2xl border px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Tip: you can select multiple products and we’ll attach them to the same quote.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
