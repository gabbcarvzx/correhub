import test from "node:test";
import assert from "node:assert/strict";
import { assertTenantAccess, assertCanModerate, assertLeaderOrAdmin, assertOwnershipOrAdmin } from "./policies";

test("assertTenantAccess rejects cross-tenant access", () => {
  assert.throws(() => assertTenantAccess("tenant-a", "tenant-b"), /Cross-tenant access denied/);
});

test("assertTenantAccess allows same tenant access", () => {
  assert.doesNotThrow(() => assertTenantAccess("tenant-a", "tenant-a"));
});

test("assertCanModerate rejects non-admin roles", () => {
  assert.throws(() => assertCanModerate("RUNNER"), /Insufficient permissions/);
});

test("assertCanModerate allows ADMIN role", () => {
  assert.doesNotThrow(() => assertCanModerate("ADMIN"));
});

test("assertLeaderOrAdmin rejects RUNNER role", () => {
  assert.throws(() => assertLeaderOrAdmin("RUNNER"), /Insufficient permissions/);
});

test("assertLeaderOrAdmin allows GROUP_LEADER role", () => {
  assert.doesNotThrow(() => assertLeaderOrAdmin("GROUP_LEADER"));
});

test("assertLeaderOrAdmin allows ADMIN role", () => {
  assert.doesNotThrow(() => assertLeaderOrAdmin("ADMIN"));
});

test("assertOwnershipOrAdmin allows same user", () => {
  assert.doesNotThrow(() => assertOwnershipOrAdmin("user-1", "user-1", "RUNNER"));
});

test("assertOwnershipOrAdmin rejects different non-admin user", () => {
  assert.throws(() => assertOwnershipOrAdmin("user-1", "user-2", "RUNNER"), /Access denied/);
});

test("assertOwnershipOrAdmin allows admin to access any user", () => {
  assert.doesNotThrow(() => assertOwnershipOrAdmin("user-1", "user-2", "ADMIN"));
});
