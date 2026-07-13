import test from "node:test";
import assert from "node:assert/strict";
import { getClientIp, getRateLimitHeaders, RATE_LIMITS, checkRedisHealth } from "./rate-limit";

test("getClientIp returns forwarded IP or fallback", () => {
  const mockRequest = {
    headers: new Map([
      ["x-forwarded-for", "192.168.1.1, 10.0.0.1"],
    ]),
  } as unknown as Request;

  const ip = getClientIp(mockRequest);
  assert.equal(ip, "192.168.1.1");
});

test("getClientIp returns x-real-ip when no forwarded header", () => {
  const mockRequest = {
    headers: new Map([["x-real-ip", "10.0.0.1"]]),
  } as unknown as Request;

  const ip = getClientIp(mockRequest);
  assert.equal(ip, "10.0.0.1");
});

test("getClientIp returns 127.0.0.1 when no IP headers", () => {
  const mockRequest = {
    headers: new Map(),
  } as unknown as Request;

  const ip = getClientIp(mockRequest);
  assert.equal(ip, "127.0.0.1");
});

test("RATE_LIMITS has expected structure", () => {
  assert.ok(RATE_LIMITS.LOGIN.maxRequests > 0);
  assert.ok(RATE_LIMITS.CHECK_IN.maxRequests > 0);
  assert.ok(RATE_LIMITS.ATTENDANCE.maxRequests > 0);
  assert.ok(RATE_LIMITS.API_GENERAL.maxRequests > 0);
  assert.ok(RATE_LIMITS.ADMIN_ACTIONS.maxRequests > 0);
});

test("getRateLimitHeaders returns correct headers for denied request", () => {
  const result = {
    allowed: false,
    remaining: 0,
    resetInMs: 30000,
  };

  const headers = getRateLimitHeaders(result);
  // X-RateLimit-Limit = remaining + (allowed ? 1 : 0) = 0 + 0 = 0
  assert.equal(headers["X-RateLimit-Limit"], "0");
  assert.equal(headers["X-RateLimit-Remaining"], "0");
  assert.equal(headers["X-RateLimit-Reset"], "30");
});

test("getRateLimitHeaders for allowed request", () => {
  const result = {
    allowed: true,
    remaining: 4,
    resetInMs: 50000,
  };

  const headers = getRateLimitHeaders(result);
  assert.equal(headers["X-RateLimit-Limit"], "5");
  assert.equal(headers["X-RateLimit-Remaining"], "4");
  assert.equal(headers["X-RateLimit-Reset"], "50");
});

test("checkRedisHealth returns false when Redis is not configured", async () => {
  // Without env vars, checkRedisHealth should return false
  const originalUrl = process.env.UPSTASH_REDIS_REST_URL;
  const originalToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;

  const healthy = await checkRedisHealth();
  assert.equal(healthy, false);

  // Restore
  if (originalUrl) process.env.UPSTASH_REDIS_REST_URL = originalUrl;
  if (originalToken) process.env.UPSTASH_REDIS_REST_TOKEN = originalToken;
});
