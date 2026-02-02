type Hit = { count: number; ts: number };

const hits = new Map<string, Hit>();

export function rateLimit(ip: string, maxPerWindow = 10, windowMs = 60_000) {
  const now = Date.now();
  const row = hits.get(ip);

  if (!row || now - row.ts > windowMs) {
    hits.set(ip, { count: 1, ts: now });
    return { ok: true, remaining: maxPerWindow - 1 };
  }

  if (row.count >= maxPerWindow) {
    return { ok: false, remaining: 0 };
  }

  row.count += 1;
  return { ok: true, remaining: maxPerWindow - row.count };
}
