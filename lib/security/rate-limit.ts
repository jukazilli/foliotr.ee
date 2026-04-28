export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export const AUTH_LOGIN_RATE_LIMIT: RateLimitOptions = {
  windowMs: 60_000,
  max: 8,
};

export const AUTH_MUTATION_RATE_LIMIT: RateLimitOptions = {
  windowMs: 60_000,
  max: 5,
};

export const PUBLIC_REVIEW_RATE_LIMIT: RateLimitOptions = {
  windowMs: 10 * 60_000,
  max: 3,
};

export function checkRateLimit(
  key: string,
  options: RateLimitOptions,
  now = Date.now()
): RateLimitResult {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return {
      allowed: true,
      remaining: options.max - 1,
      retryAfterMs: 0,
      resetAt: now + options.windowMs,
    };
  }

  if (bucket.count >= options.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: bucket.resetAt - now,
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: options.max - bucket.count,
    retryAfterMs: 0,
    resetAt: bucket.resetAt,
  };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();
  return forwardedIp || request.headers.get("x-real-ip") || "unknown";
}

export function getRateLimitKey(
  request: Request,
  scope: string,
  identifier?: string
): string {
  const ip = getClientIp(request);
  const normalizedIdentifier = identifier?.trim().toLowerCase() || "anonymous";
  return `${scope}:${ip}:${normalizedIdentifier}`;
}

export function resetRateLimitStore(): void {
  buckets.clear();
}
