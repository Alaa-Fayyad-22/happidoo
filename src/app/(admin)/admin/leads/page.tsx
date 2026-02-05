// src/app/(admin)/admin/leads/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";

type LeadStatus = "new" | "contacted" | "booked" | "closed";

type Lead = {
  id: string;
  createdAt: string;
  status: LeadStatus | string;

  // backward compatible (old)
  productSlug: string | null;
  productName?: string | null;

  // new (multi)
  productSlugs?: string[] | null;
  productNames?: string[] | null;

  // changed: range
  eventStartDate: string;
  eventEndDate: string;

  timeWindow: string;
  city: string;
  address: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
};

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "booked", label: "Booked" },
  { value: "closed", label: "Closed" },
];

function statusBadgeClass(status: string) {
  switch (status) {
    case "new":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "contacted":
      return "bg-yellow-50 text-yellow-700 border-yellow-100";
    case "booked":
      return "bg-green-50 text-green-700 border-green-100";
    case "closed":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

function formatEventRange(start?: string, end?: string) {
  const s = (start || "").trim();
  const e = (end || "").trim();
  if (!s && !e) return "—";
  if (s && !e) return s;
  if (!s && e) return e;
  if (s === e) return s;
  return `${s} → ${e}`;
}

function leadProductsBadges(x: Lead) {
  const names = Array.isArray(x.productNames) ? x.productNames.filter(Boolean) : [];
  const slugs = Array.isArray(x.productSlugs) ? x.productSlugs.filter(Boolean) : [];

  const items =
    names.length > 0
      ? names
      : slugs.length > 0
      ? slugs
      : [x.productName || x.productSlug || "—"];

  return items;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads", { cache: "no-store" });
      const data = (await res.json()) as any;

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Failed to load leads");
      }

      const arr = Array.isArray(data.leads) ? data.leads : [];
      setLeads(arr);
    } catch (e) {
      setLeads([]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, next: LeadStatus) {
    const prev = leads;
    setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, status: next } : l)));
    setSavingId(id);

    try {
      const res = await fetch(`/api/admin/leads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Failed to update lead");
      }

      const updated = data.lead as Lead;
      setLeads((cur) => cur.map((l) => (l.id === id ? { ...l, ...updated } : l)));
    } catch (e) {
      console.error(e);
      setLeads(prev);
      alert("Failed to update status. Please try again.");
    } finally {
      setSavingId(null);
    }
  }

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let out = leads;

    if (statusFilter !== "all") {
      out = out.filter((x) => x.status === statusFilter);
    }

    if (!s) return out;

    return out.filter((x) =>
      [
        x.name,
        x.email,
        x.phone,
        x.city,
        x.eventStartDate,
        x.eventEndDate,
        x.productSlug || "",
        x.productName || "",
        x.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [leads, q, statusFilter]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <AdminSidebar />

        <section className="rounded-3xl border bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Leads</h1>
              <p className="mt-1 text-slate-700">Quote requests captured from the website.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={load}
                className="rounded-2xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-2xl border px-4 py-3"
              placeholder="Search name, email, city, product…"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full sm:w-56 rounded-2xl border px-4 py-3"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="mt-6 text-sm text-slate-600">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl border bg-slate-50 p-4 text-sm">No leads found.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="mt-6 hidden overflow-hidden rounded-3xl border lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="px-4 py-3 text-left">Created</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Event</th>
                      <th className="px-4 py-3 text-left">City</th>
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((x) => (
                      <tr key={x.id} className="border-t">
                        <td className="px-4 py-3">{new Date(x.createdAt).toLocaleString()}</td>

                        <td className="px-4 py-3">
                          <div className="font-semibold">{x.name}</div>
                          <div className="text-slate-600">{x.email}</div>
                          <div className="text-slate-600">{x.phone}</div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-semibold">
                            {formatEventRange(x.eventStartDate, x.eventEndDate)}
                          </div>
                          <div className="text-slate-600">{x.timeWindow}</div>
                        </td>

                        <td className="px-4 py-3">{x.city}</td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {leadProductsBadges(x).map((label, idx) => (
                              <span
                                key={`${x.id}-p-${idx}`}
                                className="inline-flex items-center rounded-full border bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
                                title={label}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={(x.status as LeadStatus) || "new"}
                              onChange={(e) => updateStatus(x.id, e.target.value as LeadStatus)}
                              disabled={savingId === x.id}
                              className={`rounded-xl border px-3 py-2 text-sm ${
                                savingId === x.id ? "opacity-60" : ""
                              }`}
                            >
                              {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>

                            <span
                              className={`text-xs rounded-xl border px-2 py-1 ${statusBadgeClass(
                                x.status
                              )}`}
                            >
                              {x.status}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="mt-6 grid gap-4 lg:hidden">
                {filtered.map((x) => (
                  <div key={x.id} className="rounded-3xl border bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{x.name}</div>
                        <div className="text-sm text-slate-600">{x.email}</div>
                        <div className="text-sm text-slate-600">{x.phone}</div>
                      </div>
                      <div
                        className={`rounded-2xl border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                          x.status
                        )}`}
                      >
                        {x.status}
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Created: </span>
                        {new Date(x.createdAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="text-slate-500">Event: </span>
                        {formatEventRange(x.eventStartDate, x.eventEndDate)} • {x.timeWindow}
                      </div>
                      <div>
                        <span className="text-slate-500">City: </span>
                        {x.city}
                      </div>

                      <div>
                        <div className="text-slate-500 mb-1">Products</div>
                        <div className="flex flex-wrap gap-2">
                          {leadProductsBadges(x).map((label, idx) => (
                            <span
                              key={`${x.id}-mp-${idx}`}
                              className="inline-flex items-center rounded-full border bg-white px-2.5 py-1 text-xs font-semibold text-slate-800"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="text-slate-500 mb-1">Status</div>
                        <select
                          value={(x.status as LeadStatus) || "new"}
                          onChange={(e) => updateStatus(x.id, e.target.value as LeadStatus)}
                          disabled={savingId === x.id}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        >
                          {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {x.notes ? (
                        <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                          {x.notes}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
