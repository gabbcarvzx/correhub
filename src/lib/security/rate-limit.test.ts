import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "./rate-limit";

test("checkRateLimit allows request under limit", () => {
  const result = checkRateLimit({
    identifier: "test-user",
    config: { windowMs: 60000, maxRequests: 5 },
    scope: "user",
    storeName: "test-allow"
  });

  assert.equal(result.allowed, true);
  assert.equal(result.remaining, 4);
});

test("checkRateLimit blocks when over limit", () => {
  const storeName = "test-block";
  const config = { windowMs: 60000, maxRequests: 2 };

  // Use up both allowed requests
  checkRateLimit({ identifier: "test-user", config, scope: "user", storeName });
  checkRateLimit({ identifier: "test-user", config, scope: "user", storeName });

  // Third should be denied
  const result = checkRateLimit({ identifier: "test-user", config, scope: "user", storeName });
  assert.equal(result.allowed, false);
  assert.equal(result.remaining, 0);
});

test("checkRateLimit resets after window expires", () => {
  const storeName = "test-reset";
  const config = { windowMs: 100, maxRequests: 2 };

  // Use up both allowed requests
  checkRateLimit({ identifier: "test-user", config, scope: "user", storeName });
  checkRateLimit({ identifier: "test-user", config, scope: "user", storeName });

  // Both expired, should be denied
  const denied = checkRateLimit({ identifier: "test-user", config, scope: "user", storeName });
  assert.equal(denied.allowed, false);
});

test("getClientIp returns forwarded IP or fallback", () => {
  const mockRequest = {
    headers: new Map([
      ["x-forwarded-for", "192.168.1.1, 10.0.0.1"]
    ])
  } as unknown as Request;

  const ip = getClientIp(mockRequest);
  assert.equal(ip, "192.168.1.1");
});

test("RATE_LIMITS has expected structure", () => {
  assert.ok(RATE_LIMITS.LOGIN.maxRequests > 0);
  assert.ok(RATE_LIMITS.CHECK_IN.maxRequests > 0);
  assert.ok(RATE_LIMITS.ATTENDANCE.maxRequests > 0);
  assert.ok(RATE_LIMITS.API_GENERAL.maxRequests > 0);
  assert.ok(RATE_LIMITS.ADMIN_ACTIONS.maxRequests > 0);
});

test("different identifiers have independent counters", () => {
  const storeName = "test-independent";
  const config = { windowMs: 60000, maxRequests: 1 };

  const result1 = checkRateLimit({ identifier: "user-a", config, scope: "user", storeName });
  assert.equal(result1.allowed, true);

  const result2 = checkRateLimit({ identifier: "user-b", config, scope: "user", storeName });
  assert.equal(result2.allowed, true);

  // user-a's second request should be denied
  const result3 = checkRateLimit({ identifier: "user-a", config, scope: "user", storeName });
  assert.equal(result3.allowed, false);
});
