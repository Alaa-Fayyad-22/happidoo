import { isAdminEmail, adminEmails } from "@/lib/auth";

/**
 * ADMIN_EMAILS is read at call time, so each case can set it directly.
 * Two concerns are in tension here and both are tested:
 *   - fail-closed: nobody gets in when the allowlist is absent/empty
 *   - no false lockout: a real admin still gets in when the env var is
 *     formatted sloppily (casing, padding, trailing commas, quotes)
 */
const ORIGINAL = process.env.ADMIN_EMAILS;

afterEach(() => {
  process.env.ADMIN_EMAILS = ORIGINAL;
});

function withAllowlist(value: string | undefined) {
  if (value === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = value;
}

describe("fail-closed", () => {
  it.each([
    ["unset", undefined],
    ["empty string", ""],
    ["only whitespace", "   "],
    ["only separators", ",,,"],
    ["whitespace and separators", " , ,  , "],
  ])("denies everyone when ADMIN_EMAILS is %s", (_label, value) => {
    withAllowlist(value as string | undefined);
    expect(adminEmails()).toEqual([]);
    expect(isAdminEmail("owner@happidoo.org")).toBe(false);
    expect(isAdminEmail("anyone@example.com")).toBe(false);
  });

  it("denies a null/undefined/empty email even with a populated allowlist", () => {
    withAllowlist("owner@happidoo.org");
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });

  it("denies a non-listed email", () => {
    withAllowlist("owner@happidoo.org");
    expect(isAdminEmail("attacker@evil.com")).toBe(false);
  });

  it("does not match on substring or domain alone", () => {
    withAllowlist("owner@happidoo.org");
    expect(isAdminEmail("owner@happidoo.org.evil.com")).toBe(false);
    expect(isAdminEmail("notowner@happidoo.org")).toBe(false);
    expect(isAdminEmail("happidoo.org")).toBe(false);
  });
});

describe("no accidental lockout of a legitimate admin", () => {
  it("matches regardless of casing on either side", () => {
    withAllowlist("Owner@Happidoo.ORG");
    expect(isAdminEmail("owner@happidoo.org")).toBe(true);
    expect(isAdminEmail("OWNER@HAPPIDOO.ORG")).toBe(true);
    expect(isAdminEmail("OwNeR@hApPiDoO.oRg")).toBe(true);
  });

  it("tolerates padding around entries and separators", () => {
    withAllowlist("  owner@happidoo.org ,   second@gmail.com  ");
    expect(isAdminEmail("owner@happidoo.org")).toBe(true);
    expect(isAdminEmail("second@gmail.com")).toBe(true);
  });

  it("tolerates trailing/leading/duplicate commas", () => {
    withAllowlist(",owner@happidoo.org,,second@gmail.com,");
    expect(adminEmails()).toEqual(["owner@happidoo.org", "second@gmail.com"]);
    expect(isAdminEmail("owner@happidoo.org")).toBe(true);
    expect(isAdminEmail("second@gmail.com")).toBe(true);
  });

  it("tolerates a trailing newline (common when pasting into a dashboard)", () => {
    withAllowlist("owner@happidoo.org,second@gmail.com\n");
    expect(isAdminEmail("second@gmail.com")).toBe(true);
  });

  it("matches every entry in a multi-admin list", () => {
    withAllowlist("a@happidoo.org,b@gmail.com,c@example.com");
    expect(isAdminEmail("a@happidoo.org")).toBe(true);
    expect(isAdminEmail("b@gmail.com")).toBe(true);
    expect(isAdminEmail("c@example.com")).toBe(true);
  });

  it("preserves plus-addressing exactly", () => {
    withAllowlist("owner+admin@gmail.com");
    expect(isAdminEmail("owner+admin@gmail.com")).toBe(true);
    expect(isAdminEmail("owner@gmail.com")).toBe(false);
  });
});

/**
 * Documents the formats that DO fail, so the behaviour is a known constraint
 * rather than a surprise lockout during an incident.
 */
describe("known unsupported ADMIN_EMAILS formats", () => {
  it("does not accept semicolon separators", () => {
    withAllowlist("owner@happidoo.org;second@gmail.com");
    expect(isAdminEmail("owner@happidoo.org")).toBe(false);
  });

  it("does not strip surrounding quotes itself", () => {
    withAllowlist('"owner@happidoo.org"');
    expect(isAdminEmail("owner@happidoo.org")).toBe(false);
  });
});
