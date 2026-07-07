import test from "node:test";
import assert from "node:assert/strict";
import { validateCheckInWindow, ensureCheckInAllowed } from "./check-in-service";

test("validateCheckInWindow rejects dates outside the allowed window", () => {
  const opensAt = new Date("2026-07-08T05:00:00.000Z");
  const closesAt = new Date("2026-07-08T06:00:00.000Z");

  assert.equal(validateCheckInWindow(new Date("2026-07-08T04:59:00.000Z"), opensAt, closesAt), false);
  assert.equal(validateCheckInWindow(new Date("2026-07-08T06:01:00.000Z"), opensAt, closesAt), false);
});

test("ensureCheckInAllowed rejects duplicate check-in", () => {
  assert.throws(
    () =>
      ensureCheckInAllowed({
        alreadyCheckedIn: true,
        now: new Date("2026-07-08T05:10:00.000Z"),
        opensAt: new Date("2026-07-08T05:00:00.000Z"),
        closesAt: new Date("2026-07-08T06:00:00.000Z")
      }),
    /Check-in already registered/
  );
});
