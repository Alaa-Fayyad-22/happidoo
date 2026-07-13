import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { testimonialInput } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const hdrs = await headers();
  const clientIp =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const rl = await rateLimit(`testimonial:${clientIp}`, 5, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = testimonialInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { rating, message, name, city, website } = parsed.data;

  // Honeypot: if bots filled it, pretend success but save nothing
  if (website && website.trim() !== "") {
    return new NextResponse(null, { status: 204 });
  }

  const ip = clientIp === "unknown" ? null : clientIp;
  const userAgent = hdrs.get("user-agent");

  // Normalize empty strings to null (clean DB)
  const clean = (s?: string) => {
    const t = (s ?? "").trim();
    return t ? t : null;
  };

  try {
    await prisma.testimonial.create({
      data: {
        rating,
        message: clean(message),
        name: clean(name),
        city: clean(city),
        ip,
        userAgent,
        isApproved: false, // admin approves later
      },
    });
  } catch (err) {
    console.error("[testimonials] failed to save testimonial:", err);
    return NextResponse.json(
      { error: "We couldn't save your review. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

// Show ONLY approved + not hidden testimonials (for your site)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 12), 50);

  const items = await prisma.testimonial.findMany({
    where: { isApproved: true, isHidden: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      rating: true,
      message: true,
      name: true,
      city: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ items });
}
