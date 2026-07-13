// src/app/api/quote/route.ts
import { NextRequest, NextResponse } from "next/server";
import { QuoteSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { addLead } from "@/lib/leadsStore";
// import { sendGmail } from "@/lib/gmailSender";
import { sendSMTP } from "@/lib/smtpSender";

function formatEventRange(start: string | null, end: string | null) {
  if (!start && !end) return "-";
  if (start && !end) return start;
  if (!start && end) return end;
  if (start === end) return start; // single-day
  return `${start} → ${end}`;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rl = await rateLimit(`quote:${ip}`, 8, 60_000);
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

  // Saving the lead is the only step that must succeed: it is the business
  // record. If it fails, tell the caller plainly rather than 500-ing.
  let lead: Awaited<ReturnType<typeof addLead>>;
  try {
    lead = await addLead(body);
  } catch (err) {
    console.error("[quote] failed to save lead:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We couldn't save your request. Please try again, or contact us directly.",
      },
      { status: 500 }
    );
  }

  const eventText = `${formatEventRange(lead.eventStartDate, lead.eventEndDate)} (${lead.timeWindow})`;
  const productNames = Array.isArray((lead as any).productNames) ? (lead as any).productNames : [];
  const productsText =
    (productNames.length ? productNames.join(", ") : "") ||
    (lead.productSlugs?.length ? lead.productSlugs.join(", ") : "") ||
    lead.productSlug ||
    "-";

  // Email is a follow-up, not part of capturing the lead. A mail outage must
  // never lose a quote or show the customer an error for a request we did
  // record — so failures are logged and surfaced as a flag, not thrown.
  let customerEmailSent = false;
  let adminEmailSent = false;

  if (lead.email && lead.email.trim()) {
    try {
      await sendSMTP({
        to: lead.email.trim(),
        subject: `We received your quote #${lead.quoteNo}`,
        text:
          `✅ Quote received!\n\n` +
          `Quote #: ${lead.quoteNo}\n` +
          `Event: ${eventText}\n` +
          `Products: ${productsText}\n\n` +
          `We’ll contact you soon.`,
      });
      customerEmailSent = true;
    } catch (err) {
      console.error(
        `[quote] lead ${lead.id} (#${lead.quoteNo}) saved, but customer confirmation email failed:`,
        err
      );
    }
  }

  const adminTo = process.env.ADMIN_NOTIFY_TO;
  if (adminTo) {
    try {
      await sendSMTP({
        to: adminTo,
        subject: `New quote #${lead.quoteNo} — ${lead.name || "Unknown"}`,
        replyTo: lead.email?.trim() || undefined,
        text:
          `New quote received:\n\n` +
          `Quote #: ${lead.quoteNo}\n` +
          `Name: ${lead.name}\n` +
          `Phone: ${lead.phone}\n` +
          `Email: ${lead.email}\n` +
          `Event: ${eventText}\n` +
          `City: ${lead.city}\n` +
          `Address: ${lead.address}\n` +
          `Products: ${productsText}\n` +
          `Notes: ${lead.notes || "-"}`,
      });
      adminEmailSent = true;
    } catch (err) {
      // Loudest case: the lead is captured but nobody has been told about it.
      console.error(
        `[quote] ADMIN NOTIFY FAILED for lead ${lead.id} (#${lead.quoteNo}) — ` +
          `lead is saved but unannounced; check /admin/leads:`,
        err
      );
    }
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Received",

      // The lead is saved either way; these let the UI soften its wording when
      // no confirmation email actually went out.
      customerEmailSent,
      adminEmailSent,

      // IDs
      leadId: lead.id,
      quoteNo: lead.quoteNo,

      // server-generated
      createdAt: lead.createdAt,

      // event details
      eventStartDate: lead.eventStartDate,
      eventEndDate: lead.eventEndDate,
      timeWindow: lead.timeWindow,

 
      productName: productNames[0] ?? null,
      productNames,


      // optional echo
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
