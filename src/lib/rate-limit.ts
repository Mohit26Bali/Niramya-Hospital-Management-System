/**
 * Small in-memory limits. They protect a single running server; on serverless hosting each instance counts
 * separately, so treat them as a brake, not a guarantee (a shared store such as Redis is the real fix).
 */
export class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly maxKeys = 5000
  ) {}

  allow(key: string, now = Date.now()): boolean {
    if (this.hits.size > this.maxKeys) {
      for (const [k, v] of this.hits) if (!v.length || now - v[v.length - 1] >= this.windowMs) this.hits.delete(k);
    }
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  /** Seconds until one more request would be allowed. */
  retryAfter(key: string, now = Date.now()): number {
    const first = this.hits.get(key)?.[0];
    return first === undefined ? 1 : Math.max(1, Math.ceil((this.windowMs - (now - first)) / 1000));
  }

  reset(key?: string) {
    if (key) this.hits.delete(key);
    else this.hits.clear();
  }
}

/**
 * The visitor's address. X-Forwarded-For is believed only when TRUSTED_PROXY_HOPS says how many proxies
 * sit in front of the app (Vercel counts as 1); with 0 a visitor could invent a new address per request.
 */
export function clientIp(headers: { get(name: string): string | null }): string {
  const hops = Number(process.env.TRUSTED_PROXY_HOPS ?? 0) || 0;
  if (hops > 0) {
    const parts = (headers.get("x-forwarded-for") ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= hops) return parts[parts.length - hops];
  }
  return "unknown";
}

/**
 * Failed-login tracking per account: after MAX_FAILURES wrong passwords the account refuses logins for
 * LOCK_MS, so a password cannot be guessed at speed. A successful login clears the count.
 */
export class LoginThrottle {
  private failures = new Map<string, { count: number; first: number; lockedUntil: number }>();

  constructor(
    private readonly maxFailures = 5,
    private readonly lockMs = 15 * 60_000,
    private readonly windowMs = 15 * 60_000
  ) {}

  isLocked(key: string, now = Date.now()): boolean {
    const f = this.failures.get(key);
    return !!f && f.lockedUntil > now;
  }

  fail(key: string, now = Date.now()) {
    const f = this.failures.get(key);
    if (!f || now - f.first > this.windowMs) {
      this.failures.set(key, { count: 1, first: now, lockedUntil: 0 });
      return;
    }
    f.count += 1;
    if (f.count >= this.maxFailures) f.lockedUntil = now + this.lockMs;
  }

  succeed(key: string) {
    this.failures.delete(key);
  }

  reset() {
    this.failures.clear();
  }
}
