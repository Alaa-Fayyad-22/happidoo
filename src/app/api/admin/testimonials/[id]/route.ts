// src/app/api/admin/testimonials/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { checkOrigin } from "@/lib/security";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function toBool(v: unknown, defaultValue: boolean): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(s)) return true;
    if (["false", "0", "no", "n", "off"].includes(s)) return false;
  }
  if (typeof v === "number") return v !== 0;
  return defaultValue;
}

/**
 * PATCH body:
 * { isApproved?: boolean, isHidden?: boolean }
 */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const csrf = checkOrigin(req);
  if (csrf) return csrf;

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;

  if (!id) return jsonError("id is required", 400);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const data: { isApproved?: boolean; isHidden?: boolean } = {};

  if (body?.isApproved !== undefined) {
    data.isApproved = toBool(body.isApproved, false);
  }

  if (body?.isHidden !== undefined) {
    data.isHidden = toBool(body.isHidden, false);
  }

  // If hiding, also unapprove by default
  if (data.isHidden === true && data.isApproved === undefined) {
    data.isApproved = false;
  }

  try {
    const updated = await prisma.testimonial.update({
      where: { id },
      data,
    });
    return NextResponse.json({ item: updated });
  } catch {
    return jsonError("Testimonial not found", 404);
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const csrf = checkOrigin(_req);
  if (csrf) return csrf;

  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const { id } = await context.params;

  if (!id) return jsonError("id is required", 400);

  try {
    await prisma.testimonial.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Testimonial not found", 404);
  }
}
