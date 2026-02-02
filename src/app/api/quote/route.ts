import { NextRequest, NextResponse } from "next/server";
import { QuoteSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { addLead } from "@/lib/leadsStore";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rl = rateLimit(ip, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = QuoteSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid input.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const body = parsed.data;

  // Honeypot: bots fill hidden fields
  if (body.website && body.website.trim().length > 0) {
    return NextResponse.json({ ok: true, message: "OK" }, { status: 200 });
  }

  const lead = await addLead(body);


  return NextResponse.json({ ok: true, message: "Received", leadId: lead.id }, { status: 200 });
}
