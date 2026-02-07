import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { testimonialInput } from "@/lib/validators";

export async function POST(req: Request) {
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

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;

  const userAgent = h.get("user-agent");

  // Normalize empty strings to null (clean DB)
  const clean = (s?: string) => {
    const t = (s ?? "").trim();
    return t ? t : null;
  };

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
