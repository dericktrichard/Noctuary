import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Use in-memory rate limiting for free tier
// For production with Upstash Redis, uncomment below
/*
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const orderRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 orders per hour per IP
});
*/

// Simple in-memory rate limiting for free tier
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function checkOrderRateLimit(identifier: string): Promise<{ success: boolean; remaining?: number }> {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000; // 24 hours
  const maxRequests = 5; // 5 orders per 24 hours

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(identifier);

  if (!record || record.resetAt < now) {
    // First request or window expired
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  // Increment count
  record.count++;
  return { success: true, remaining: maxRequests - record.count };
}