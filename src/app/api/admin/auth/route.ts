import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };

  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) {
    return NextResponse.json(
      { ok: false, message: "ADMIN_PASSWORD is not set on server." },
      { status: 500 }
    );
  }

  if (!password || password !== expected) {
    return NextResponse.json({ ok: false, message: "Wrong password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
