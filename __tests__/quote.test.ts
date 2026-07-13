/**
 * Covers the revenue-critical path: quote submission -> lead persisted ->
 * follow-up email. The invariant under test is that the lead survives an email
 * outage: mail is a follow-up, not part of capturing the business record.
 *
 * Prisma and SMTP are mocked; validation, lead normalisation (leadsStore) and
 * rate limiting run for real.
 */
jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: jest.fn() },
    lead: { create: jest.fn() },
  },
}));

jest.mock("@/lib/smtpSender", () => ({ sendSMTP: jest.fn() }));

import { NextRequest } from "next/server";
import { POST } from "@/app/api/quote/route";
import { prisma } from "@/lib/prisma";
import { sendSMTP } from "@/lib/smtpSender";

const createLead = prisma.lead.create as jest.Mock;
const findProducts = prisma.product.findMany as jest.Mock;
const smtp = sendSMTP as jest.Mock;

const VALID = {
  productSlugs: ["bouncy-castle"],
  eventStartDate: "2026-08-01",
  eventEndDate: "2026-08-02",
  timeWindow: "Morning",
  city: "Beirut",
  address: "Hamra St 12",
  name: "Test Customer",
  phone: "+9613000000",
  email: "customer@example.com",
  notes: "birthday party",
  website: "",
};

const SAVED_LEAD = {
  id: "lead_abc",
  quoteNo: 1042,
  createdAt: new Date("2026-07-13T10:00:00Z"),
  status: "new",
  productSlug: "bouncy-castle",
  productSlugs: ["bouncy-castle"],
  productNames: ["Bouncy Castle"],
  eventStartDate: "2026-08-01",
  eventEndDate: "2026-08-02",
  timeWindow: "Morning",
  city: "Beirut",
  address: "Hamra St 12",
  name: "Test Customer",
  phone: "+9613000000",
  email: "customer@example.com",
  notes: "birthday party",
};

// Each test uses a distinct IP so the real rate limiter doesn't bleed across cases.
let ipCounter = 0;
function post(body: unknown) {
  ipCounter += 1;
  return new NextRequest("http://localhost:3000/api/quote", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `10.0.0.${ipCounter}`,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ADMIN_NOTIFY_TO = "admin@happidoo.org";
  findProducts.mockResolvedValue([{ slug: "bouncy-castle", name: "Bouncy Castle" }]);
  createLead.mockResolvedValue(SAVED_LEAD);
  smtp.mockResolvedValue(undefined);
});

describe("happy path", () => {
  it("saves the lead and sends both emails", async () => {
    const res = await POST(post(VALID));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toMatchObject({
      ok: true,
      leadId: "lead_abc",
      quoteNo: 1042,
      customerEmailSent: true,
      adminEmailSent: true,
    });

    expect(createLead).toHaveBeenCalledTimes(1);
    expect(createLead.mock.calls[0][0].data).toMatchObject({
      name: "Test Customer",
      city: "Beirut",
      productSlugs: ["bouncy-castle"],
      productNames: ["Bouncy Castle"],
    });

    expect(smtp).toHaveBeenCalledTimes(2);
    const recipients = smtp.mock.calls.map((c) => c[0].to);
    expect(recipients).toEqual(["customer@example.com", "admin@happidoo.org"]);
  });

  it("resolves product slugs to names for the emails", async () => {
    await POST(post(VALID));
    const adminMail = smtp.mock.calls[1][0];
    expect(adminMail.text).toContain("Bouncy Castle");
    expect(adminMail.replyTo).toBe("customer@example.com");
  });
});

describe("the lead survives email failure", () => {
  it("still returns success when the customer confirmation fails", async () => {
    smtp.mockRejectedValueOnce(new Error("SMTP 421 service unavailable"));

    const res = await POST(post(VALID));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.leadId).toBe("lead_abc");
    expect(json.customerEmailSent).toBe(false);
    // admin still notified
    expect(json.adminEmailSent).toBe(true);
    expect(createLead).toHaveBeenCalledTimes(1);
  });

  it("still returns success when the admin notification fails", async () => {
    smtp
      .mockResolvedValueOnce(undefined) // customer ok
      .mockRejectedValueOnce(new Error("SMTP auth failed")); // admin fails

    const res = await POST(post(VALID));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.customerEmailSent).toBe(true);
    expect(json.adminEmailSent).toBe(false);
  });

  it("still returns success when SMTP is down entirely", async () => {
    smtp.mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await POST(post(VALID));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.leadId).toBe("lead_abc");
    expect(json.customerEmailSent).toBe(false);
    expect(json.adminEmailSent).toBe(false);
    // The lead was still written — this is the whole point.
    expect(createLead).toHaveBeenCalledTimes(1);
  });
});

describe("database failure", () => {
  it("returns a clear 500 and does not send email for a lead that was never saved", async () => {
    createLead.mockRejectedValue(new Error("connection terminated"));

    const res = await POST(post(VALID));
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.ok).toBe(false);
    expect(json.message).toMatch(/couldn't save your request/i);
    expect(smtp).not.toHaveBeenCalled();
  });
});

describe("input handling", () => {
  it("rejects invalid JSON with 400", async () => {
    const res = await POST(post("this-is-not-json"));
    expect(res.status).toBe(400);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("rejects a payload missing required fields with 400", async () => {
    const res = await POST(post({ ...VALID, city: "", name: "" }));
    expect(res.status).toBe(400);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("rejects a quote with neither phone nor email", async () => {
    const res = await POST(post({ ...VALID, phone: "", email: "" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(JSON.stringify(json.issues)).toMatch(/phone number or an email/i);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("rejects an end date before the start date", async () => {
    const res = await POST(
      post({ ...VALID, eventStartDate: "2026-08-05", eventEndDate: "2026-08-01" })
    );
    expect(res.status).toBe(400);
    expect(createLead).not.toHaveBeenCalled();
  });

  it("silently drops honeypot submissions without touching the database", async () => {
    const res = await POST(post({ ...VALID, website: "http://spam.example" }));

    expect(res.status).toBe(200);
    expect(createLead).not.toHaveBeenCalled();
    expect(smtp).not.toHaveBeenCalled();
  });
});

describe("rate limiting", () => {
  it("returns 429 once the per-IP window is exhausted", async () => {
    const ip = "203.0.113.99";
    const send = () =>
      POST(
        new NextRequest("http://localhost:3000/api/quote", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": ip },
          body: JSON.stringify(VALID),
        })
      );

    // Limit is 8/min for the quote endpoint.
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) statuses.push((await send()).status);

    expect(statuses.slice(0, 8)).toEqual(Array(8).fill(200));
    expect(statuses.slice(8)).toEqual([429, 429]);
    expect(createLead).toHaveBeenCalledTimes(8);
  });
});
