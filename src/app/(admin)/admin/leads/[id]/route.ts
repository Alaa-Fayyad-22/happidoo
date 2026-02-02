// src/app/api/admin/leads/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AllowedStatus = ["new", "contacted", "booked", "closed"] as const;
type LeadStatus = (typeof AllowedStatus)[number];

function isAllowedStatus(x: unknown): x is LeadStatus {
  return typeof x === "string" && (AllowedStatus as readonly string[]).includes(x);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const p =
    typeof (ctx.params as any)?.then === "function"
      ? await (ctx.params as Promise<{ id: string }>)
      : (ctx.params as { id: string });

  const id = p?.id;
  if (!id) {
    return NextResponse.json({ ok: false, message: "Missing id." }, { status: 400 });
  }

  let raw: any = null;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  const status = raw?.status;
  const notes = raw?.notes;

  if (status !== undefined && !isAllowedStatus(status)) {
    return NextResponse.json(
      { ok: false, message: "Invalid status." },
      { status: 400 }
    );
  }

  if (notes !== undefined && typeof notes !== "string") {
    return NextResponse.json(
      { ok: false, message: "Invalid notes." },
      { status: 400 }
    );
  }

  // Nothing to update
  if (status === undefined && notes === undefined) {
    return NextResponse.json({ ok: false, message: "No fields to update." }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  return NextResponse.json({ ok: true, lead }, { status: 200 });
}
