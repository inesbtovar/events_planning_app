// lib/rate-limit.ts
// In-memory rate limiter.
// NOTE: This works correctly on a single Vercel instance (serverless function).
// If you ever move to multi-region or multiple instances, replace the Map
// with Upstash Redis: https://upstash.com — the API is identical.

type Entry = { count: number; resetAt: number }
const store = new Map<string, Entry>()

// Prune expired entries to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store.entries()) {
    if (v.resetAt < now) store.delete(k)
  }
}, 10 * 60 * 1000)

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  ip: string,
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now()
  const storeKey = `${key}:${ip}`
  const entry = store.get(storeKey)

  if (!entry || entry.resetAt < now) {
    store.set(storeKey, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, remaining: options.limit - 1, resetAt: now + options.windowMs }
  }

  entry.count++
  const remaining = Math.max(0, options.limit - entry.count)
  const allowed = entry.count <= options.limit

  return { allowed, remaining, resetAt: entry.resetAt }
}

// Extract real client IP from Vercel/proxy headers
export function getIP(request: Request): string {
  // x-forwarded-for can be a comma-separated list; first value is the client
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}