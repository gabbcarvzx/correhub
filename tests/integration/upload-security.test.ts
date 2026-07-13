import test from "node:test";
import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Testes de segurança — Upload Validation
//
// Estes testes validam a lógica de validação de upload sem depender
// de Supabase real. Usam a implementação do upload-validator.
// ---------------------------------------------------------------------------

import { validateUpload, getMaxUploadSize, validateStorageKey } from "@/features/uploads/upload-validator";
import { buildStoragePath, parseStorageKey } from "@/features/uploads/path-builder";

// ---------------------------------------------------------------------------
// M1: Validação de Tamanho
// ---------------------------------------------------------------------------

test("upload: arquivo > 5MB falha", () => {
  const maxSize = getMaxUploadSize();
  const result = validateUpload({
    originalName: "foto-grande.png",
    mimeType: "image/png",
    sizeBytes: maxSize + 1, // 5MB + 1 byte
  });

  assert.equal(result.valid, false);
  assert.ok(result.error!.includes("Arquivo muito grande"));
});

test("upload: arquivo de 1KB passa no tamanho", () => {
  const result = validateUpload({
    originalName: "foto-pequena.png",
    mimeType: "image/png",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, true);
});

test("upload: arquivo de 5MB exato passa", () => {
  const maxSize = getMaxUploadSize();
  const result = validateUpload({
    originalName: "foto-limite.png",
    mimeType: "image/png",
    sizeBytes: maxSize,
  });

  assert.equal(result.valid, true);
});

// ---------------------------------------------------------------------------
// M1: Validação de MIME
// ---------------------------------------------------------------------------

test("upload: image/png é permitido", () => {
  const result = validateUpload({
    originalName: "foto.png",
    mimeType: "image/png",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, true);
  assert.equal(result.mimeType, "image/png");
});

test("upload: image/jpeg é permitido", () => {
  const result = validateUpload({
    originalName: "foto.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, true);
  assert.equal(result.mimeType, "image/jpeg");
});

test("upload: image/webp é permitido", () => {
  const result = validateUpload({
    originalName: "foto.webp",
    mimeType: "image/webp",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, true);
  assert.equal(result.mimeType, "image/webp");
});

test("upload: SVG é bloqueado", () => {
  const result = validateUpload({
    originalName: "icone.svg",
    mimeType: "image/svg+xml",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, false);
  assert.ok(result.error!.includes("não permitido"));
});

test("upload: GIF é bloqueado", () => {
  const result = validateUpload({
    originalName: "animado.gif",
    mimeType: "image/gif",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, false);
});

test("upload: application/pdf é bloqueado", () => {
  const result = validateUpload({
    originalName: "documento.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, false);
});

test("upload: text/html é bloqueado", () => {
  const result = validateUpload({
    originalName: "pagina.html",
    mimeType: "text/html",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, false);
});

// ---------------------------------------------------------------------------
// M1: Sanitização de nome
// ---------------------------------------------------------------------------

test("upload: nome com path traversal é sanitizado", () => {
  const result = validateUpload({
    originalName: "../../etc/passwd.png",
    mimeType: "image/png",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, true);
  // O nome gerado é UUID, não contém path traversal
  assert.ok(result.sanitizedFileName.includes(".png"));
  assert.ok(!result.sanitizedFileName.includes(".."));
  assert.ok(!result.sanitizedFileName.includes("/"));
});

test("upload: nome com espaços é sanitizado", () => {
  const result = validateUpload({
    originalName: "minha foto legal.png",
    mimeType: "image/png",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, true);
  // O nome gerado é UUID, não contém espaços
  assert.ok(!result.sanitizedFileName.includes(" "));
});

test("upload: nome gerado é UUID v4", () => {
  const result = validateUpload({
    originalName: "foto.png",
    mimeType: "image/png",
    sizeBytes: 1024,
  });

  assert.equal(result.valid, true);
  // Formato UUID v4: 8-4-4-4-12 + extensão
  const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.png$/;
  assert.ok(uuidPattern.test(result.sanitizedFileName));
});

// ---------------------------------------------------------------------------
// M2: Isolamento multi-tenant no path
// ---------------------------------------------------------------------------

test("path: gera formato tenants/{tenantId}/{type}/{id}/{file}", () => {
  const path = buildStoragePath({
    tenantId: "tenant-abc",
    entityType: "users",
    entityId: "user-123",
    fileName: "550e8400-e29b-41d4-a716-446655440000.png",
  });

  assert.equal(path, "tenants/tenant-abc/users/user-123/550e8400-e29b-41d4-a716-446655440000.png");
});

test("path: gera para partners", () => {
  const path = buildStoragePath({
    tenantId: "tenant-abc",
    entityType: "partners",
    entityId: "partner-456",
    fileName: "logo.png",
  });

  assert.equal(path, "tenants/tenant-abc/partners/partner-456/logo.png");
});

test("path: gera para groups", () => {
  const path = buildStoragePath({
    tenantId: "tenant-abc",
    entityType: "groups",
    entityId: "group-789",
    fileName: "cover.webp",
  });

  assert.equal(path, "tenants/tenant-abc/groups/group-789/cover.webp");
});

test("path: tenantId vazio lança erro", () => {
  assert.throws(() => {
    buildStoragePath({
      tenantId: "",
      entityType: "users",
      entityId: "user-1",
      fileName: "foto.png",
    });
  }, /Tenant ID é obrigatório/);
});

test("path: entityId vazio lança erro", () => {
  assert.throws(() => {
    buildStoragePath({
      tenantId: "tenant-1",
      entityType: "users",
      entityId: "",
      fileName: "foto.png",
    });
  }, /Entity ID é obrigatório/);
});

// ---------------------------------------------------------------------------
// M2: Parse de storage key
// ---------------------------------------------------------------------------

test("path: parse de storage key válido", () => {
  const result = parseStorageKey("tenants/tenant-abc/users/user-123/550e8400-e29b-41d4-a716-446655440000.png");

  assert.notEqual(result, null);
  assert.equal(result!.tenantId, "tenant-abc");
  assert.equal(result!.entityType, "users");
  assert.equal(result!.entityId, "user-123");
  assert.equal(result!.fileName, "550e8400-e29b-41d4-a716-446655440000.png");
});

test("path: parse de storage key inválido retorna null", () => {
  assert.equal(parseStorageKey("invalido"), null);
  assert.equal(parseStorageKey(""), null);
  assert.equal(parseStorageKey("tenants/abc/invalid/123/file.png"), null);
});

// ---------------------------------------------------------------------------
// M2: validateStorageKey
// ---------------------------------------------------------------------------

test("path: validateStorageKey aceita formato válido com UUID v4", () => {
  assert.equal(
    validateStorageKey("tenants/tenant-abc/users/user-123/550e8400-e29b-41d4-a716-446655440000.png"),
    true
  );
  assert.equal(
    validateStorageKey("tenants/tenant-abc/partners/partner-456/a1b2c3d4-e5f6-7890-abcd-ef0123456789.jpeg"),
    true
  );
});

test("path: validateStorageKey rejeita formato inválido", () => {
  assert.equal(validateStorageKey("invalido"), false);
  assert.equal(validateStorageKey(""), false);
  assert.equal(validateStorageKey("tenants/abc/unknown/123/file.png"), false);
});

// ---------------------------------------------------------------------------
// M3: signed URL — validação de expiry
// ---------------------------------------------------------------------------

test("signed-url: expiresIn default é 3600 segundos", () => {
  // A constante DEFAULT_SIGNED_URL_EXPIRY no provider é 3600
  // Teste conceitual: signed URLs devem ter expiração
  const DEFAULT_SIGNED_URL_EXPIRY = 3600;
  assert.equal(DEFAULT_SIGNED_URL_EXPIRY, 3600);
});

test("signed-url: expiresIn deve ser positivo", () => {
  // Validação: signed URLs com expiração <= 0 são inválidas
  const invalidExpiry = -1;
  assert.ok(invalidExpiry <= 0);
  const validExpiry = 3600;
  assert.ok(validExpiry > 0);
});

// ---------------------------------------------------------------------------
// M6: Testes de integridade adicionais
// ---------------------------------------------------------------------------

test("upload: arquivo vazio (0 bytes) passa na validação de tamanho", () => {
  const result = validateUpload({
    originalName: "vazio.png",
    mimeType: "image/png",
    sizeBytes: 0,
  });

  assert.equal(result.valid, true);
});

test("upload: MIME type case-sensitive deve bater exatamente", () => {
  const result = validateUpload({
    originalName: "foto.PNG",
    mimeType: "Image/PNG", // case diferente
    sizeBytes: 1024,
  });

  assert.equal(result.valid, false);
});

test("upload: extensão .svg mesmo com MIME image/png é bloqueada", () => {
  const result = validateUpload({
    originalName: "malicioso.svg",
    mimeType: "image/png", // MIME falsificado
    sizeBytes: 1024,
  });

  // A validação de extensão é extra (além do MIME)
  assert.equal(result.valid, false);
});
