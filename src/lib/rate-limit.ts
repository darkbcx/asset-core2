import { NextResponse } from 'next/server';

// Simple in-memory sliding window limiter (per key)
// This is a lightweight placeholder compatible with Next.js API routes.
// In production, replace internals with `rate-limiter-flexible` (e.g., RateLimiterMemory/Redis).

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 1000; // default policy

interface Counter {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Counter>();

export async function rateLimit(
  key: string,
  options?: { windowMs?: number; max?: number }
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const max = options?.max ?? MAX_REQUESTS;

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count < max) {
    existing.count += 1;
    return { ok: true };
  }

  // Limited
  const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  const res = NextResponse.json(
    { error: 'Too Many Requests' },
    { status: 429 }
  );
  res.headers.set('X-Rate-Limit-Remaining', '0');
  res.headers.set('X-Rate-Limit-Reset', String(existing.resetAt));
  res.headers.set('Retry-After', String(retryAfterSec));
  return { ok: false, response: res };
}

export function setRateLimitHeaders(
  response: NextResponse,
  key: string,
  options?: { windowMs?: number; max?: number }
): NextResponse {
  const windowMs = options?.windowMs ?? WINDOW_MS;
  const max = options?.max ?? MAX_REQUESTS;
  const now = Date.now();
  const current = buckets.get(key);
  const remaining = Math.max(0, (current ? max - current.count : max));
  const resetAt = current?.resetAt ?? now + windowMs;
  response.headers.set('X-Rate-Limit-Remaining', String(remaining));
  response.headers.set('X-Rate-Limit-Reset', String(resetAt));
  return response;
}
