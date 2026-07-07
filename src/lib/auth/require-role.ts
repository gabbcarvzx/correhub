import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAuthenticatedTenant } from "@/lib/security/tenant";
import { logger } from "@/features/observability/logger";

export async function requireRole(roles: string[]) {
  const session = await auth();

  if (!session?.user) {
    logger.info("auth.redirect_unauthenticated", { path: "/login" });
    redirect("/login");
  }

  if (!roles.includes(session.user.role)) {
    logger.warn("auth.redirect_insufficient_role", {
      userRole: session.user.role,
      requiredRoles: roles
    });
    redirect("/dashboard");
  }

  try {
    await getAuthenticatedTenant();
  } catch {
    redirect("/login");
  }

  return session.user;
}
