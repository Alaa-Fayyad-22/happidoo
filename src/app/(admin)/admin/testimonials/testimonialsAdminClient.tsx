"use client";

import { useState } from "react";

type Item = {
  id: string;
  rating: number;
  message: string | null;
  name: string | null;
  city: string | null;
  createdAt?: string;
};

export default function TestimonialsAdminClient({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function approve(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      if (!res.ok) throw new Error("approve failed");
      setItems((xs) => xs.filter((x) => x.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      setItems((xs) => xs.filter((x) => x.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
        No pending testimonials 🎉
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((t) => (
        <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {t.name || "Anonymous"} {t.city ? `• ${t.city}` : ""}
              </div>
              <div className="mt-1 text-sm text-slate-600">Rating: {t.rating}/5</div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={busyId === t.id}
                onClick={() => approve(t.id)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                Approve
              </button>
              <button
                disabled={busyId === t.id}
                onClick={() => remove(t.id)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>

          {t.message ? (
            <p className="mt-4 text-slate-800">“{t.message}”</p>
          ) : (
            <p className="mt-4 text-slate-500 italic">No message (rating only)</p>
          )}
        </div>
      ))}
    </div>
  );
}
