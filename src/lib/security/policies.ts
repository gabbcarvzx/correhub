import { auth } from "@/auth";
import { logger } from "@/features/observability/logger";
import { sanitizeRole } from "@/lib/auth/helpers";
import { verifyTenantAccess } from "./tenant";

/**
 * Valida que o recurso pertence ao mesmo tenant do usuário autenticado.
 */
export function assertTenantAccess(resourceTenantId: string, actorTenantId: string): void {
  if (resourceTenantId !== actorTenantId) {
    logger.warn("tenant.cross_tenant_denied", { resourceTenantId, actorTenantId });
    throw new Error("Cross-tenant access denied.");
  }
}

export function assertCanModerate(role: string): void {
  const sanitizedRole = sanitizeRole(role);
  if (sanitizedRole !== "ADMIN") {
    logger.warn("auth.insufficient_permissions", { role, requiredRole: "ADMIN" });
    throw new Error("Insufficient permissions.");
  }
}

export function assertLeaderOrAdmin(role: string): void {
  if (role !== "GROUP_LEADER" && role !== "ADMIN") {
    logger.warn("auth.insufficient_permissions", {
      role,
      requiredRoles: ["GROUP_LEADER", "ADMIN"],
    });
    throw new Error("Insufficient permissions.");
  }
}

/**
 * Valida que o recurso pertence ao usuário atual OU o usuário é admin.
 */
export function assertOwnershipOrAdmin(
  resourceUserId: string,
  currentUserId: string,
  role: string
): void {
  if (resourceUserId !== currentUserId && role !== "ADMIN") {
    logger.warn("auth.ownership_denied", { resourceUserId, currentUserId, role });
    throw new Error("Access denied.");
  }
}

/**
 * Verifica se a sessão é válida e tem a role necessária.
 * Lança erro com mensagens específicas para logging/monitoring.
 */
export async function requireSessionWithRole(roles: string[]) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized.");
  }

  // Sanitiza a role do usuário antes de comparar
  const sanitizedRole = sanitizeRole(session.user.role);

  if (session.user.tenantId) {
    await verifyTenantAccess(session.user.tenantId);
  }

  if (!roles.includes(sanitizedRole)) {
    logger.warn("auth.role_required", {
      userRole: sanitizedRole,
      requiredRoles: roles,
      userId: session.user.id,
    });
    throw new Error("Insufficient permissions.");
  }

  return session.user;
}
