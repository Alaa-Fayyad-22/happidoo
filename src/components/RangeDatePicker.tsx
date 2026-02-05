"use client";

import { useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";


function toYmd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fromYmd(s: string) {
  if (!s) return undefined;
  // parse as local date (safe for YYYY-MM-DD)
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function prettyRangeLabel(from?: Date, to?: Date) {
  if (!from && !to) return "Select a date range";
  if (from && !to) return `${format(from, "MMM d, yyyy")} → …`;
  return `${format(from!, "MMM d, yyyy")} → ${format(to!, "MMM d, yyyy")}`;
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

  const range: DateRange | undefined = useMemo(() => {
    if (!from && !to) return undefined;
    return { from, to };
  }, [from, to]);

  const minDate = useMemo(() => fromYmd(minYmd)!, [minYmd]);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-2xl border px-4 py-3 text-left focus:ring-2 focus:ring-slate-200 outline-none disabled:opacity-50"
      >
        <div className="text-sm text-slate-900">
          {prettyRangeLabel(from, to)}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Click to choose start and end dates
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] bg-black/30"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="mx-auto mt-10 w-[92vw] max-w-md rounded-3xl border bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="text-base font-bold text-slate-900">
                Select date range
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
                Selected:{" "}
                <span className="font-semibold">
                  {prettyRangeLabel(from, to)}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                  onClick={() => onChange({ startYmd: "", endYmd: "" })}
                >
                  Clear
                </button>

                <button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  onClick={() => setOpen(false)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
