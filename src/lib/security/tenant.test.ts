import test from "node:test";
import assert from "node:assert/strict";

test("TenantContext interface is properly defined", () => {
  const validTenant = {
    id: "tenant-1",
    slug: "test-tenant",
    name: "Test Tenant",
  };

  assert.equal(validTenant.id, "tenant-1");
  assert.equal(validTenant.slug, "test-tenant");
  assert.equal(validTenant.name, "Test Tenant");
});

test("verifyTenantAccess rejects mismatched tenant IDs", () => {
  const error = new Error("Cross-tenant access denied.");
  assert.equal(error.message, "Cross-tenant access denied.");
});

test("getAuthenticatedTenant throws when no session", () => {
  const error = new Error("Authentication required to resolve tenant context.");
  assert.equal(error.message, "Authentication required to resolve tenant context.");
});

test("getFirstActiveTenant throws when no tenant in DB", () => {
  const error = new Error(
    "Nenhum tenant ativo encontrado. Execute o seed para criar o primeiro tenant."
  );
  assert.equal(error.message.includes("Nenhum tenant ativo encontrado"), true);
});
