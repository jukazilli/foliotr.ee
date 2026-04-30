import { jsonError } from "@/lib/server/api";
import {
  checkRateLimitAsync,
  getRateLimitKey,
  rateLimitHeaders,
  type RateLimitOptions,
} from "@/lib/security/rate-limit";

export async function rateLimitResponse(
  request: Request,
  scope: string,
  identifier: string | undefined,
  options: RateLimitOptions
): Promise<Response | null> {
  const result = await checkRateLimitAsync(
    getRateLimitKey(request, scope, identifier),
    options
  );

  if (result.allowed) return null;

  return jsonError("RATE_LIMITED", 429, undefined, {
    headers: rateLimitHeaders(result),
  });
}
