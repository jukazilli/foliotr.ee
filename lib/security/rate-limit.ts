import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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
const distributedLimiters = new Map<string, Ratelimit>();
let redisClient: Redis | null | undefined;
let distributedRateLimitDisabled = false;

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

export const SEARCH_RATE_LIMIT: RateLimitOptions = {
  windowMs: 60_000,
  max: 30,
};

export const UPLOAD_RATE_LIMIT: RateLimitOptions = {
  windowMs: 10 * 60_000,
  max: 20,
};

export const APP_MUTATION_RATE_LIMIT: RateLimitOptions = {
  windowMs: 60_000,
  max: 60,
};

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function getDistributedLimiter(options: RateLimitOptions): Ratelimit | null {
  if (distributedRateLimitDisabled) return null;

  const redis = getRedisClient();
  if (!redis) return null;

  const key = `${options.windowMs}:${options.max}`;
  const existing = distributedLimiters.get(key);
  if (existing) return existing;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      options.max,
      `${Math.max(1, Math.ceil(options.windowMs / 1000))} s`
    ),
    prefix: "linkfolio:ratelimit",
  });
  distributedLimiters.set(key, limiter);
  return limiter;
}

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

export async function checkRateLimitAsync(
  key: string,
  options: RateLimitOptions,
  now = Date.now()
): Promise<RateLimitResult> {
  const limiter = getDistributedLimiter(options);

  if (!limiter) {
    return checkRateLimit(key, options, now);
  }

  try {
    const result = await limiter.limit(key);
    return {
      allowed: result.success,
      remaining: result.remaining,
      retryAfterMs: Math.max(0, result.reset - now),
      resetAt: result.reset,
    };
  } catch (error) {
    distributedRateLimitDisabled = true;
    distributedLimiters.clear();
    console.error("[rate-limit] Distributed limiter failed; using in-memory fallback.", {
      error: error instanceof Error ? error.message : String(error),
    });
    return checkRateLimit(key, options, now);
  }
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: Record<string, string> = {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };

  if (!result.allowed) {
    headers["Retry-After"] = String(Math.ceil(result.retryAfterMs / 1000));
  }

  return headers;
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
  distributedLimiters.clear();
  redisClient = undefined;
  distributedRateLimitDisabled = false;
}
