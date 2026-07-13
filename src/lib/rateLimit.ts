import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  limit: number;
};

function upstashConfigured() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/* ------------------------------------------------------------------ *
 * In-memory fallback
 *
 * Only correct for a single long-lived process. On serverless each instance
 * keeps its own Map, so the limit is enforced per-instance and resets on cold
 * start. Used for local dev, and as a last resort in production if Upstash is
 * not configured — it still blunts naive floods, but it is not a global limit.
 * ------------------------------------------------------------------ */

type Hit = { count: number; ts: number };
const hits = new Map<string, Hit>();

function memoryRateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const row = hits.get(key);

  if (!row || now - row.ts > windowMs) {
    hits.set(key, { count: 1, ts: now });
    return { ok: true, remaining: max - 1, limit: max };
  }

  if (row.count >= max) {
    return { ok: false, remaining: 0, limit: max };
  }

  row.count += 1;
  return { ok: true, remaining: max - row.count, limit: max };
}

/* ------------------------------------------------------------------ *
 * Upstash — shared across every serverless instance
 * ------------------------------------------------------------------ */

const limiters = new Map<string, Ratelimit>();

function getLimiter(max: number, windowMs: number): Ratelimit {
  const cacheKey = `${max}:${windowMs}`;
  let limiter = limiters.get(cacheKey);

  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(max, `${windowMs} ms`),
      prefix: "ratelimit",
      analytics: false,
    });
    limiters.set(cacheKey, limiter);
  }

  return limiter;
}

let warnedNoUpstash = false;

/**
 * Sliding-window rate limit, keyed by a caller-supplied identifier
 * (conventionally "<scope>:<ip>").
 *
 * Fails OPEN: if Redis is unreachable the request is allowed. A rate-limiter
 * outage must not take down the public quote form, which is the revenue path.
 */
export async function rateLimit(
  key: string,
  max = 10,
  windowMs = 60_000
): Promise<RateLimitResult> {
  if (!upstashConfigured()) {
    if (!warnedNoUpstash && process.env.NODE_ENV === "production") {
      warnedNoUpstash = true;
      console.warn(
        "[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN not set — falling back to " +
          "per-instance in-memory limiting, which does not hold across serverless instances."
      );
    }
    return memoryRateLimit(key, max, windowMs);
  }

  try {
    const { success, remaining, limit } = await getLimiter(max, windowMs).limit(key);
    return { ok: success, remaining, limit };
  } catch (err) {
    console.error("[rateLimit] Upstash unavailable, allowing request:", err);
    return { ok: true, remaining: max, limit: max };
  }
}
