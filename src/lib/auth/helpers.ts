import { logger } from "@/features/observability/logger";

const VALID_ROLES = ["RUNNER", "GROUP_LEADER", "PARTNER", "ADMIN"] as const;
export type ValidRole = (typeof VALID_ROLES)[number];

function isValidRole(role: unknown): role is ValidRole {
  return typeof role === "string" && VALID_ROLES.includes(role as ValidRole);
}

/**
 * Valida se a role é um valor esperado do enum UserRole.
 * Se não for, usa RUNNER como fallback seguro (nunca ADMIN).
 * Loga um aviso se a role for inválida.
 */
export function sanitizeRole(role: unknown): ValidRole {
  if (isValidRole(role)) return role;
  logger.warn("auth.invalid_role_sanitized", { role: String(role) });
  return "RUNNER";
}

/**
 * Valida se o tenantId é uma string não vazia.
 * Se não for, retorna string vazia.
 */
export function sanitizeTenantId(tenantId: unknown): string {
  return typeof tenantId === "string" && tenantId.length > 0 ? tenantId : "";
}
