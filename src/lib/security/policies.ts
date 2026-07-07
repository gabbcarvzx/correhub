import { auth } from "@/auth";
import { logger } from "@/features/observability/logger";
import { verifyTenantAccess } from "./tenant";

/**
 * Validates that a resource belongs to the same tenant as the authenticated user.
 * Cross-checks against the JWT session claims to prevent spoofing.
 *
 * @deprecated Use verifyTenantAccess() from tenant.ts instead, which cross-validates against the session.
 */
export function assertTenantAccess(resourceTenantId: string, actorTenantId: string): void {
  if (resourceTenantId !== actorTenantId) {
    throw new Error("Cross-tenant access denied.");
  }
}

export function assertCanModerate(role: string): void {
  if (role !== "ADMIN") {
    logger.warn("auth.insufficient_permissions", { role, requiredRole: "ADMIN" });
    throw new Error("Insufficient permissions.");
  }
}

export function assertLeaderOrAdmin(role: string): void {
  if (role !== "GROUP_LEADER" && role !== "ADMIN") {
    logger.warn("auth.insufficient_permissions", { role, requiredRoles: ["GROUP_LEADER", "ADMIN"] });
    throw new Error("Insufficient permissions.");
  }
}

/**
 * Validates that the resource belongs to the current user OR the user has admin role.
 * Use for operations where a user can act on their own data.
 */
export function assertOwnershipOrAdmin(resourceUserId: string, currentUserId: string, role: string): void {
  if (resourceUserId !== currentUserId && role !== "ADMIN") {
    logger.warn("auth.ownership_denied", { resourceUserId, currentUserId, role });
    throw new Error("Access denied.");
  }
}

/**
 * Verifies the session is valid and has the required role.
 * Throws with specific error messages for logging/monitoring.
 */
export async function requireSessionWithRole(roles: string[]) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized.");
  }

  if (session.user.tenantId) {
    await verifyTenantAccess(session.user.tenantId);
  }

  if (!roles.includes(session.user.role)) {
    logger.warn("auth.role_required", {
      userRole: session.user.role,
      requiredRoles: roles,
      userId: session.user.id
    });
    throw new Error("Insufficient permissions.");
  }

  return session.user;
}
