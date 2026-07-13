import { Redis } from "@upstash/redis";
import { logger } from "@/features/observability/logger";

// ---------------------------------------------------------------------------
// Redis client – fail fast if env vars are missing
// ---------------------------------------------------------------------------
function createRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    const error =
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set. " +
      "Get them at https://console.upstash.com/redis";
    logger.error("rate_limit.redis_misconfigured", { hasUrl: !!url, hasToken: !!token });
    throw new Error(error);
  }

  return new Redis({ url, token });
}

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

// ---------------------------------------------------------------------------
// Rate limit configs (same interface as in-memory version)
// ---------------------------------------------------------------------------
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000,   // 15 min
    maxRequests: process.env.NODE_ENV === "production" ? 5 : 20,
  },
  CHECK_IN: {
    windowMs: 60 * 1000,         // 1 min
    maxRequests: 10,
  },
  ATTENDANCE: {
    windowMs: 60 * 1000,         // 1 min
    maxRequests: 20,
  },
  API_GENERAL: {
    windowMs: 60 * 1000,         // 1 min
    maxRequests: 60,
  },
  ADMIN_ACTIONS: {
    windowMs: 60 * 1000,         // 1 min
    maxRequests: 30,
  },
} as const;

export type RateLimitScope = "ip" | "user";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

// ---------------------------------------------------------------------------
// Sliding window implementation using Redis Sorted Sets
//
// Key format:  rate-limit:{storeName}:{identifier}
// Score:       timestamp of each request
// Value:       `${timestamp}` (unique enough for our purpose)
//
// Strategy:
// 1. Remove entries outside the window
// 2. Count remaining entries
// 3. If count >= max → DENY, else → ALLOW
// 4. Add current entry
// 5. Set TTL on the key for automatic cleanup
// ---------------------------------------------------------------------------

const KEY_PREFIX = "rate-limit";

function buildKey(storeName: string, identifier: string): string {
  return `${KEY_PREFIX}:${storeName}:${identifier}`;
}

/**
 * Sliding window rate limit check via Redis.
 *
 * Uses ZREMRANGEBYSCORE to remove expired entries,
 * ZCARD to count remaining, then ZADD for the new entry.
 * Lua script ensures atomicity in a single round-trip.
 */
const SLIDING_WINDOW_SCRIPT = `
  local key = KEYS[1]
  local window_start = ARGV[1]
  local now = ARGV[2]
  local max_requests = tonumber(ARGV[3])
  local ttl_seconds = ARGV[4]

  -- Remove entries outside the window
  redis.call("ZREMRANGEBYSCORE", key, "0", window_start)

  -- Count remaining entries
  local count = redis.call("ZCARD", key)

  local allowed = 0
  local remaining = max_requests - count - 1
  if remaining >= 0 then
    allowed = 1
  end

  -- Add current request with score = now
  redis.call("ZADD", key, now, now)

  -- If this is a new key, set TTL
  redis.call("EXPIRE", key, ttl_seconds)

  -- Get the oldest entry timestamp for Retry-After
  local oldest = redis.call("ZRANGE", key, 0, 0, "WITHSCORES")
  local reset_ms = 0
  if oldest and oldest[2] then
    reset_ms = tonumber(ARGV[2]) - tonumber(oldest[2])
    if reset_ms < 0 then reset_ms = 0 end
  end

  return {allowed, remaining, reset_ms, count}
`;

export async function checkRateLimit(input: {
  identifier: string;
  config: RateLimitConfig;
  scope: RateLimitScope;
  storeName?: string;
}): Promise<RateLimitResult> {
  const { identifier, config, storeName = "default" } = input;
  const redis = getRedis();
  const now = Date.now();
  const windowStartMs = now - config.windowMs;
  const windowStart = String(windowStartMs);
  const nowStr = String(now);
  const ttlSeconds = Math.ceil(config.windowMs / 1000) + 60; // window + 1min buffer

  const key = buildKey(storeName, identifier);

  try {
    const result = (await redis.eval(
      SLIDING_WINDOW_SCRIPT,
      [key],
      [windowStart, nowStr, String(config.maxRequests), String(ttlSeconds)]
    )) as [number, number, number, number];

    const allowed = result[0] === 1;
    const remaining = result[1];
    const resetInMs = result[2];

    if (!allowed) {
      logger.warn("rate_limit.exceeded", {
        identifier: identifier.slice(0, 20),
        scope: input.scope,
        storeName,
        limit: config.maxRequests,
        resetInMs,
      });
    }

    return { allowed, remaining: Math.max(0, remaining), resetInMs };
  } catch (error) {
    // If Redis is down, fail OPEN (allow request) but log critically
    logger.error("rate_limit.redis_error", {
      error: String(error),
      identifier: identifier.slice(0, 20),
      storeName,
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetInMs: config.windowMs };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.remaining + (result.allowed ? 1 : 0)),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetInMs / 1000)),
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

/**
 * Manually clear rate limit entries for a given identifier + store.
 * Useful for clearing login rate limits after successful authentication.
 */
export async function clearRateLimit(input: {
  identifier: string;
  storeName?: string;
}): Promise<void> {
  try {
    const redis = getRedis();
    const key = buildKey(input.storeName ?? "default", input.identifier);
    await redis.del(key);
  } catch (error) {
    logger.error("rate_limit.clear_error", {
      error: String(error),
      identifier: input.identifier.slice(0, 20),
    });
  }
}

/**
 * Redis health check – used for readiness probes.
 */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = getRedis();
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
