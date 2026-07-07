import { logger } from "@/features/observability/logger";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  let store = stores.get(name);
  if (!store) {
    store = new Map();
    stores.set(name, store);
  }
  return store;
}

function cleanupStore(store: Map<string, RateLimitEntry>, windowMs: number): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now - entry.windowStart > windowMs) {
      store.delete(key);
    }
  }
}

export type RateLimitScope = "ip" | "user";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export function checkRateLimit(input: {
  identifier: string;
  config: RateLimitConfig;
  scope: RateLimitScope;
  storeName?: string;
}): RateLimitResult {
  const { identifier, config, storeName = "default" } = input;
  const store = getStore(storeName);
  const now = Date.now();

  cleanupStore(store, config.windowMs);

  const entry = store.get(identifier);

  if (!entry || now - entry.windowStart > config.windowMs) {
    store.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: config.maxRequests - 1, resetInMs: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    const resetInMs = entry.windowStart + config.windowMs - now;
    logger.warn("rate_limit.exceeded", {
      identifier: identifier.slice(0, 20),
      scope: input.scope,
      storeName,
      count: entry.count,
      limit: config.maxRequests
    });
    return { allowed: false, remaining: 0, resetInMs };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetInMs: entry.windowStart + config.windowMs - now };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.remaining + (result.allowed ? 1 : 0)),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetInMs / 1000))
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

// Predefined rate limit configs
export const RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: process.env.NODE_ENV === "production" ? 5 : 20
  },
  CHECK_IN: {
    windowMs: 60 * 1000,
    maxRequests: 10
  },
  ATTENDANCE: {
    windowMs: 60 * 1000,
    maxRequests: 20
  },
  API_GENERAL: {
    windowMs: 60 * 1000,
    maxRequests: 60
  },
  ADMIN_ACTIONS: {
    windowMs: 60 * 1000,
    maxRequests: 30
  }
} as const;
