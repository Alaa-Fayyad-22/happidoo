// src/app/api/admin/leads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateLead } from "@/lib/leadsStore";

const PatchSchema = z
  .object({
    status: z.string().trim().min(1).optional(),
    notes: z.string().trim().max(5000).optional(),
  })
  .strict();

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  // ✅ Works whether params is sync OR Promise (Next.js 16 can be either)
  const resolved = await Promise.resolve((ctx as any).params);
  const id = ((resolved?.id as string) || "").trim();

  if (!id) {
    return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { status, notes } = parsed.data;

  if (status == null && notes == null) {
    return NextResponse.json({ ok: false, message: "Nothing to update" }, { status: 400 });
  }

  // normalize common statuses so UI "Booked" doesn't create random variants
  const normalizedStatus = status
    ? status.toLowerCase() === "booked"
      ? "booked"
      : status.toLowerCase() === "contacted"
      ? "contacted"
      : status.toLowerCase() === "closed"
      ? "closed"
      : status.toLowerCase() === "new"
      ? "new"
      : status
    : undefined;

  try {
    const updated = await updateLead(id, { status: normalizedStatus, notes });

    if (!updated) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead: updated }, { status: 200 });
  } catch (e: any) {
    console.error("PATCH /api/admin/leads/[id] failed:", e);
    return NextResponse.json({ ok: false, message: "Server error" }, { status: 500 });
  }
}
