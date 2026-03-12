import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const USE_REDIS = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

let redisRateLimit: Ratelimit | null = null;

if (USE_REDIS) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    redisRateLimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '24 h'),
      analytics: true,
      prefix: 'noctuary:ratelimit',
    });
    
    console.log('[RATE_LIMIT] Using Upstash Redis for production rate limiting');
  } catch (error) {
    console.error('[RATE_LIMIT] Redis initialization failed, falling back to in-memory:', error);
  }
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const CLEANUP_INTERVAL = 60 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }

  let cleaned = 0;
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key);
      cleaned++;
    }
  }

  lastCleanup = now;
  
  if (cleaned > 0) {
    console.log(`[RATE_LIMIT] Cleaned ${cleaned} expired entries`);
  }
}

async function checkWithRedis(identifier: string) {
  if (!redisRateLimit) {
    throw new Error('Redis rate limiter not initialized');
  }

  const result = await redisRateLimit.limit(identifier);
  
  return {
    success: result.success,
    remaining: result.remaining,
  };
}

function checkWithMemory(identifier: string) {
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000;
  const maxRequests = 5;

  cleanupExpiredEntries();

  const record = rateLimitMap.get(identifier);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: maxRequests - record.count };
}

export async function checkOrderRateLimit(identifier: string): Promise<{ success: boolean; remaining?: number }> {
  const normalizedIdentifier = identifier.toLowerCase().trim();

  if (!normalizedIdentifier) {
    return { success: false, remaining: 0 };
  }

  try {
    if (redisRateLimit) {
      return await checkWithRedis(normalizedIdentifier);
    }
    return checkWithMemory(normalizedIdentifier);
  } catch (error) {
    console.error('[RATE_LIMIT] Check failed:', error);
    
    if (redisRateLimit) {
      console.log('[RATE_LIMIT] Falling back to in-memory');
      return checkWithMemory(normalizedIdentifier);
    }
    
    throw error;
  }
}

export function getRateLimitStats() {
  if (redisRateLimit) {
    return {
      type: 'redis',
      provider: 'upstash',
      window: '24h',
      maxRequests: 5,
    };
  }

  return {
    type: 'in-memory',
    provider: 'local',
    window: '24h',
    maxRequests: 5,
    activeEntries: rateLimitMap.size,
  };
}