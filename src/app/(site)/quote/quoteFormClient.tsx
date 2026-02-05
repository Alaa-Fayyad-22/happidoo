// src/app/(site)/quote/quoteFormClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

type ProductOption = {
  slug: string;
  name: string;
  imagePath?: string | null; // storage key in bucket
};

type Props = {
  products: ProductOption[];
  initialSelectedSlugs: string[];
};

type QuotePayload = {
  productSlug: string | null; // backward compatible
  productSlugs: string[]; // new (multi)

  eventStartDate: string; // YYYY-MM-DD
  eventEndDate: string; // YYYY-MM-DD
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

  eventStartDate: string;
  eventEndDate: string;
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

function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromYmd(s: string) {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function prettyRangeLabel(from?: Date, to?: Date) {
  if (!from && !to) return "Select a date range";
  if (from && !to) return `${format(from, "MMM d, yyyy")} → …`;
  return `${format(from!, "MMM d, yyyy")} → ${format(to!, "MMM d, yyyy")}`;
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

    const suffix = suffixes.length > 0 ? String(suffixes[0] ?? "") : "";
    const code = `${root}${suffix}`.trim();
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

function RangeDatePicker({
  startYmd,
  endYmd,
  minYmd,
  disabled,
  onChange,
}: {
  startYmd: string;
  endYmd: string;
  minYmd: string; // todayYmd()
  disabled?: boolean;
  onChange: (next: { startYmd: string; endYmd: string }) => void;
}) {
  const [open, setOpen] = useState(false);

  const from = useMemo(() => fromYmd(startYmd), [startYmd]);
  const to = useMemo(() => fromYmd(endYmd), [endYmd]);
  const minDate = useMemo(() => fromYmd(minYmd)!, [minYmd]);

  const range: DateRange | undefined = useMemo(() => {
    if (!from && !to) return undefined;
    return { from, to };
  }, [from, to]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border px-4 py-3 text-left focus:ring-2 focus:ring-slate-200 outline-none disabled:opacity-50"
      >
        <div className="text-sm text-slate-900">{prettyRangeLabel(from, to)}</div>
        <div className="mt-1 text-xs text-slate-500">
          Click to choose start and end dates
        </div>
      </button>

      {open && (
  <div
    className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    onClick={() => setOpen(false)} // close only when clicking backdrop
  >
    <div
      className="mx-auto mt-10 w-[92vw] max-w-md rounded-3xl border bg-white shadow-2xl"
      onClick={(e) => e.stopPropagation()} // ✅ prevent click-through
      onMouseDown={(e) => e.stopPropagation()} // extra safety
    >
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <div className="text-base font-bold text-slate-900">Select date range</div>
          <div className="text-xs text-slate-600">
            Click a start date, then an end date.
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (startYmd && !endYmd) onChange({ startYmd, endYmd: startYmd });
            setOpen(false);
          }}
          className="rounded-2xl border px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Done
        </button>
      </div>

      <div className="px-5 py-4">
        <DayPicker
          mode="range"
          numberOfMonths={1}
          selected={range}
          defaultMonth={from || minDate}
          disabled={{ before: minDate }}
          onSelect={(r) => {
            const nextStart = r?.from ? toYmd(r.from) : "";
            const nextEnd = r?.to ? toYmd(r.to) : "";
            onChange({ startYmd: nextStart, endYmd: nextEnd });
          }}
        />

        <div className="mt-3 text-xs text-slate-600">
          Selected: <span className="font-semibold">{prettyRangeLabel(from, to)}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange({ startYmd: "", endYmd: "" });
            }}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (startYmd && !endYmd) onChange({ startYmd, endYmd: startYmd });
              setOpen(false);
            }}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Confirm
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Tip: if you only pick one day, we’ll treat it as a single-day event.
        </p>
      </div>
    </div>
  </div>
)}

    </>
  );
}

export default function QuoteFormClient({ products, initialSelectedSlugs }: Props) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [doneQuoteNo, setDoneQuoteNo] = useState<number | null>(null);
  const [error, setError] = useState("");

  const today = useMemo(() => todayYmd(), []);
//   const [today, setToday] = useState<string>("");
//   useEffect(() => {
//   setToday(todayYmd()); // client-only
// }, []);

  // Countries
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [form, setForm] = useState<QuotePayload>(() => {
    const initial = initialSelectedSlugs ?? [];
    return {
      productSlugs: initial,
      productSlug: initial.length > 0 ? initial[0] : null,

      eventStartDate: "",
      eventEndDate: "",
      timeWindow: "Morning",
      city: "",
      address: "",
      name: "",

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

        const lb =
        list.find((c) => c.iso2 === "LB") ||
        list.find((c) => c.name.toLowerCase().includes("lebanon"));

      if (lb) {
        setForm((p) => ({
          ...p,
          phoneCountry: lb.iso2,
          phoneCode: lb.code,
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

      if (!form.eventStartDate.trim()) throw new Error("Start date is required.");
      if (!form.eventEndDate.trim()) throw new Error("End date is required.");

      // safety check
      if (form.eventEndDate < form.eventStartDate) {
        throw new Error("End date must be on or after start date.");
      }

      if (!form.city.trim()) throw new Error("City is required.");
      if (!form.address.trim()) throw new Error("Address is required.");
      if (!form.name.trim()) throw new Error("Name is required.");
      if (!form.phone.trim() && !form.email.trim()) {
        throw new Error("Please provide at least a phone number or an email address.");
      }

      // Convert to E.164 before POST
      const phoneE164 = form.phone.trim()
        ? buildE164(form.phoneCode, form.phone)
        : "";

      if (form.phone.trim() && !phoneE164) {
        throw new Error("Phone number looks invalid. Please choose country code and enter digits.");
      }

      const payload: QuotePayload = {
        ...form,
        phone: phoneE164 || "",
        productSlug: form.productSlugs[0] ?? null,
      };

      const result = await postQuote(payload);

      setDone(true);
      setDoneQuoteNo(result.quoteNo ?? null);

      // Optional: WhatsApp redirect (currently off)
      // if (result.phone) {
      //   const productsText =
      //     selectedProducts.length > 0
      //       ? selectedProducts.map((p) => p.name).join(", ")
      //       : (result.productSlugs || []).join(", ");
      //
      //   const createdLocal = new Date(result.createdAt).toLocaleString();
      //
      //   const msg =
      //     `✅ Quote received!\n\n` +
      //     `Quote #: ${result.quoteNo}\n` +
      //     `Created: ${createdLocal}\n` +
      //     `Dates: ${result.eventStartDate} → ${result.eventEndDate} (${result.timeWindow})\n` +
      //     `Products: ${productsText}\n\n` +
      //     `We’ll contact you soon. Please keep this quote number for reference.`;
      //
      //   window.location.href = whatsappUrl(result.phone, msg);
      // }
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

  const headerRangeText = useMemo(() => {
    const from = fromYmd(form.eventStartDate);
    const to = fromYmd(form.eventEndDate);
    return prettyRangeLabel(from, to);
  }, [form.eventStartDate, form.eventEndDate]);

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
            Selected range:{" "}
            <span className="font-semibold text-slate-700">{headerRangeText}</span>
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
              <div className="grid gap-2">
                <div className="text-sm font-semibold text-slate-800">Event date range *</div>
                <RangeDatePicker
                  startYmd={form.eventStartDate}
                  endYmd={form.eventEndDate}
                  minYmd={today}
                  disabled={busy}
                  onChange={({ startYmd, endYmd }) =>
                    setForm((p) => ({ ...p, eventStartDate: startYmd, eventEndDate: endYmd }))
                  }
                />
              </div>


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
  products: { slug: string; name: string; imagePath?: string | null }[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => `${p.name} ${p.slug}`.toLowerCase().includes(query));
  }, [products, q]);

  useEffect(() => {
    let alive = true;

    (async () => {
      const need = products.filter((p) => p.imagePath && !signed[p.slug]);
      if (need.length === 0) return;

      const entries = await Promise.all(
        need.map(async (p) => {
          try {
            const res = await fetch(
              `/api/image/product?path=${encodeURIComponent(p.imagePath!)}`,
              { cache: "no-store" }
            );
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.ok || !data?.url) return [p.slug, ""] as const;
            return [p.slug, String(data.url)] as const;
          } catch {
            return [p.slug, ""] as const;
          }
        })
      );

      if (!alive) return;

      setSigned((prev) => {
        const next = { ...prev };
        for (const [slug, url] of entries) {
          if (url) next[slug] = url;
        }
        return next;
      });
    })();

    return () => {
      alive = false;
    };
    // IMPORTANT: only depend on products, not signed (avoid loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

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
                <div className="text-xs text-slate-600">Pick one or more items for this quote.</div>
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
                  <div className="p-4 text-sm text-slate-600">No products match your search.</div>
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
                            <div className="h-28 w-28 overflow-hidden rounded-xl border bg-slate-50 shrink-0">
                              {p.imagePath ? (
                                signed[p.slug] ? (
                                  <img
                                    src={signed[p.slug]}
                                    alt={p.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="h-full w-full grid place-items-center text-[10px] text-slate-400">
                                    Loading…
                                  </div>
                                )
                              ) : (
                                <div className="h-full w-full grid place-items-center text-[10px] text-slate-400">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900">{p.name}</div>
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
