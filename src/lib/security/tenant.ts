import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logger } from "@/features/observability/logger";

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  isDemo: boolean;
}

/**
 * Gets the tenant context based on the authenticated user's session.
 *
 * Security model:
 * - The tenantId in the JWT is trusted (set at login by auth.ts)
 * - We verify the tenant exists and is ACTIVE in the DB
 * - For public/unauthenticated routes, we fall back to the first active tenant
 * - NEVER returns data from a different tenant than the session claims
 */
export async function getCurrentTenant(): Promise<TenantContext> {
  const session = await auth();

  if (session?.user?.tenantId) {
    return getTenantById(session.user.tenantId);
  }

  return getFirstActiveTenant();
}

/**
 * Gets tenant context strictly from the authenticated session.
 * Throws if the user is not authenticated or the tenant is invalid.
 * Use this in protected routes and APIs.
 */
export async function getAuthenticatedTenant(): Promise<TenantContext> {
  const session = await auth();

  if (!session?.user?.tenantId) {
    throw new Error("Authentication required to resolve tenant context.");
  }

  const tenant = await getTenantById(session.user.tenantId);

  if (tenant.isDemo) {
    throw new Error("Authenticated user has no valid tenant.");
  }

  return tenant;
}

async function getTenantById(tenantId: string): Promise<TenantContext> {
  try {
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, slug: true, name: true, status: true }
    });

    if (!tenant) {
      logger.warn("tenant.not_found", { tenantId });
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    if (tenant.status !== "ACTIVE") {
      logger.warn("tenant.not_active", { tenantId, status: tenant.status });
      throw new Error(`Tenant is not active: ${tenantId}`);
    }

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      isDemo: false
    };
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Tenant not found") || error.message.includes("Tenant is not active"))) {
      throw error;
    }
    logger.error("tenant.fetch_error", { tenantId, error: String(error) });
    throw new Error("Failed to resolve tenant context.");
  }
}

async function getFirstActiveTenant(): Promise<TenantContext> {
  try {
    const tenant = await db.tenant.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
      select: { id: true, slug: true, name: true }
    });

    if (tenant) {
      return {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        isDemo: false
      };
    }
  } catch (error) {
    logger.warn("tenant.first_active_failed", { error: String(error) });
  }

  return {
    id: "demo-tenant",
    slug: "sao-lourenco",
    name: "São Lourenço da Mata",
    isDemo: true
  };
}

/**
 * Verifies a resource tenantId against the authenticated user's tenant.
 * This is the primary authorization gate to prevent cross-tenant data access.
 *
 * @throws If the resource belongs to a different tenant than the authenticated user.
 */
export async function verifyTenantAccess(resourceTenantId: string): Promise<void> {
  const tenant = await getAuthenticatedTenant();

  if (resourceTenantId !== tenant.id) {
    logger.warn("tenant.cross_tenant_access_denied", {
      resourceTenantId,
      actorTenantId: tenant.id
    });
    throw new Error("Cross-tenant access denied.");
  }
}
