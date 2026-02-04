import { NextRequest, NextResponse } from "next/server";
import { QuoteSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { addLead } from "@/lib/leadsStore";
// import { sendGmail } from "@/lib/gmailSender";
import { sendSMTP } from "@/lib/smtpSender";

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

//   if (lead.email && lead.email.trim()) {
//   await sendGmail({
//     to: lead.email.trim(),
//     subject: `We received your quote #${lead.quoteNo}`,
//     text:
//       `✅ Quote received!\n\n` +
//       `Quote #: ${lead.quoteNo}\n` +
//       `Event: ${lead.eventDate} (${lead.timeWindow})\n` +
//       `Products: ${(lead.productSlugs || []).join(", ")}\n\n` +
//       `We’ll contact you soon.`,
//   });
// }
 if (lead.email && lead.email.trim()) {
    await sendSMTP({
      to: lead.email.trim(),
      subject: `We received your quote #${lead.quoteNo}`,
      text:
        `✅ Quote received!\n\n` +
        `Quote #: ${lead.quoteNo}\n` +
        `Event: ${lead.eventDate} (${lead.timeWindow})\n` +
        `Products: ${(lead.productSlugs || []).join(", ")}\n\n` +
        `We’ll contact you soon.`,
    });
  }

   const adminTo = process.env.ADMIN_NOTIFY_TO;
  if (adminTo) {
    await sendSMTP({
      to: adminTo,
      subject: `New quote #${lead.quoteNo} — ${lead.name || "Unknown"}`,
      replyTo: lead.email?.trim() || undefined, // reply in inbox goes to customer
      text:
        `New quote received:\n\n` +
        `Quote #: ${lead.quoteNo}\n` +
        `Name: ${lead.name}\n` +
        `Phone: ${lead.phone}\n` +
        `Email: ${lead.email}\n` +
        `Event: ${lead.eventDate} (${lead.timeWindow})\n` +
        `City: ${lead.city}\n` +
        `Address: ${lead.address}\n` +
        `Products: ${(lead.productSlugs || []).join(", ") || lead.productSlug || "-"}\n` +
        `Notes: ${lead.notes || "-"}`,
    });
  }


  return NextResponse.json(
  {
    ok: true,
    message: "Received",

    // IDs
    leadId: lead.id,          // UUID (internal)
    quoteNo: lead.quoteNo,    // integer (if you added it)

    // server-generated
    createdAt: lead.createdAt,

    // event details
    eventDate: lead.eventDate,
    timeWindow: lead.timeWindow,

    // products
    productSlug: lead.productSlug,
    productSlugs: lead.productSlugs,

    // optional echo (safe for same-user response)
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    city: lead.city,
    address: lead.address,
    notes: lead.notes,
    status: lead.status,
  },
  { status: 200 }
);
}
