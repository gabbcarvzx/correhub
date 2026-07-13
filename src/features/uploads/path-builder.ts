/**
 * Path Builder — gera paths de storage com isolamento multi-tenant.
 *
 * Padrão obrigatório:
 *   tenants/{tenantId}/{type}/{entityId}/{fileName}
 *
 * O tenantId SEMPRE vem do contexto autenticado.
 * NUNCA aceita tenantId do client.
 */

// ---------------------------------------------------------------------------
// Tipos de entidade suportados
// ---------------------------------------------------------------------------

export type StorageEntityType = "users" | "partners" | "groups";

export interface StoragePathInput {
  /** Tenant ID do contexto autenticado */
  tenantId: string;
  /** Tipo de entidade */
  entityType: StorageEntityType;
  /** ID da entidade (userId, partnerId, groupId) */
  entityId: string;
  /** Nome do arquivo (já sanitizado e único) */
  fileName: string;
}

// ---------------------------------------------------------------------------
// Path builder
// ---------------------------------------------------------------------------

/**
 * Gera path de storage seguindo o padrão multi-tenant:
 *   tenants/{tenantId}/{entityType}/{entityId}/{fileName}
 *
 * @throws Se tenantId estiver vazio
 */
export function buildStoragePath(input: StoragePathInput): string {
  const { tenantId, entityType, entityId, fileName } = input;

  if (!tenantId || tenantId.length === 0) {
    throw new Error("Tenant ID é obrigatório para gerar path de storage.");
  }

  if (!entityId || entityId.length === 0) {
    throw new Error("Entity ID é obrigatório para gerar path de storage.");
  }

  if (!fileName || fileName.length === 0) {
    throw new Error("File name é obrigatório para gerar path de storage.");
  }

  return `tenants/${tenantId}/${entityType}/${entityId}/${fileName}`;
}

/**
 * Extrai metadados de um storage key.
 * Útil para auditoria e logging.
 *
 * Retorna null se o formato for inválido.
 */
export function parseStorageKey(key: string): {
  tenantId: string;
  entityType: StorageEntityType;
  entityId: string;
  fileName: string;
} | null {
  const parts = key.split("/");

  if (parts.length !== 5 || parts[0] !== "tenants") {
    return null;
  }

  const [, tenantId, entityType, entityId, fileName] = parts;

  if (!tenantId || !entityType || !entityId || !fileName) {
    return null;
  }

  if (!["users", "partners", "groups"].includes(entityType)) {
    return null;
  }

  return {
    tenantId,
    entityType: entityType as StorageEntityType,
    entityId,
    fileName,
  };
}
