// In-memory sliding-window rate limiter.
// The Map resets on cold start and is NOT shared across instances or regions.
// Acceptable at launch scale (tens of users). Interface is designed so swapping
// to Upstash Redis is a one-file change — all call sites stay untouched.

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number; // epoch ms
};

const store = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const timestamps = store.get(key) ?? [];

  // Purge timestamps outside the current window.
  const windowStart = now - windowMs;
  const active = timestamps.filter((t) => t > windowStart);

  if (active.length >= limit) {
    store.set(key, active);
    return { ok: false, remaining: 0, resetAt: active[0] + windowMs };
  }

  active.push(now);
  store.set(key, active);
  return { ok: true, remaining: limit - active.length, resetAt: now + windowMs };
}

export function getClientKey(request: Request): string {
  const headers = request.headers;

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
