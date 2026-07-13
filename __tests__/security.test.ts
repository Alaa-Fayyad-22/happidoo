import { checkOrigin } from "@/lib/security";

/**
 * The admin panel uploads via `fetch("/api/admin/upload", { method: "POST" })`
 * — a relative URL, so the browser sends Origin equal to the site's own origin.
 * These cases assert that shape is allowed on every host the app is served
 * from, while genuine cross-site posts are rejected.
 */
function req(
  method: string,
  headers: Record<string, string>,
  url = "https://happidoo.org/api/admin/upload"
) {
  return new Request(url, { method, headers });
}

describe("legitimate admin-panel requests are allowed", () => {
  it("allows a same-origin upload on the production domain", () => {
    const res = checkOrigin(
      req("POST", { origin: "https://happidoo.org", host: "happidoo.org" })
    );
    expect(res).toBeNull();
  });

  it("allows a same-origin upload behind Vercel's proxy (x-forwarded-host)", () => {
    // Vercel forwards the public hostname here; `host` may be the internal one.
    const res = checkOrigin(
      req("POST", {
        origin: "https://happidoo.org",
        "x-forwarded-host": "happidoo.org",
        host: "internal.vercel.app",
      })
    );
    expect(res).toBeNull();
  });

  it("allows a same-origin upload on a vercel.app preview deployment", () => {
    const res = checkOrigin(
      req("POST", {
        origin: "https://inflatables-site-abc123.vercel.app",
        host: "inflatables-site-abc123.vercel.app",
      })
    );
    expect(res).toBeNull();
  });

  it("allows local development on localhost:3000", () => {
    const res = checkOrigin(
      req("POST", { origin: "http://localhost:3000", host: "localhost:3000" })
    );
    expect(res).toBeNull();
  });

  it("allows every mutating method the admin panel uses", () => {
    for (const method of ["POST", "PATCH", "DELETE", "PUT"]) {
      const res = checkOrigin(
        req(method, { origin: "https://happidoo.org", host: "happidoo.org" })
      );
      expect([method, res]).toEqual([method, null]);
    }
  });

  it("never blocks safe methods, which carry no Origin", () => {
    for (const method of ["GET", "HEAD"]) {
      expect(checkOrigin(req(method, { host: "happidoo.org" }))).toBeNull();
    }
  });
});

describe("cross-site requests are rejected", () => {
  it("rejects a post from an attacker origin", async () => {
    const res = checkOrigin(
      req("POST", { origin: "https://evil.com", host: "happidoo.org" })
    );
    expect(res?.status).toBe(403);
    await expect(res!.json()).resolves.toMatchObject({
      message: "Cross-origin request rejected",
    });
  });

  it("rejects a lookalike domain", () => {
    const res = checkOrigin(
      req("POST", { origin: "https://happidoo.org.evil.com", host: "happidoo.org" })
    );
    expect(res?.status).toBe(403);
  });

  it("rejects a mutating request with no Origin header", () => {
    const res = checkOrigin(req("POST", { host: "happidoo.org" }));
    expect(res?.status).toBe(403);
  });

  it("rejects a malformed Origin header", () => {
    const res = checkOrigin(req("POST", { origin: "not-a-url", host: "happidoo.org" }));
    expect(res?.status).toBe(403);
  });
});
