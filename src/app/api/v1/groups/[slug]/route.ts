import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getAuthenticatedTenant } from "@/lib/security/tenant";
import { db } from "@/lib/db";
import { invalidateSignedUrlCache, refreshSignedUrlCache } from "@/features/uploads/signed-url-cache";
import { logger } from "@/features/observability/logger";

const updateGroupSchema = z.object({
  logoStorageKey: z.string().min(1, "Storage key inválido."),
});

/**
 * PATCH /api/v1/groups/[slug]
 *
 * Atualiza o logo de um grupo. Apenas o líder do grupo ou admin pode alterar.
 *
 * Body (JSON):
 *   logoStorageKey: string — storage key do logo no Supabase
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
    }

    const tenant = await getAuthenticatedTenant();
    const { slug } = await context.params;

    const group = await db.group.findFirst({
      where: { tenantId: tenant.id, slug, deletedAt: null },
      select: { id: true, slug: true, name: true, logoUrl: true, leaderUserId: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    const isLeader = group.leaderUserId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isLeader && !isAdmin) {
      logger.security("groups.logo.unauthorized", {
        userId: session.user.id,
        groupSlug: slug,
        groupLeaderId: group.leaderUserId,
      });
      return NextResponse.json(
        { error: "Você não tem permissão para alterar o logo deste grupo." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = updateGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { logoStorageKey } = parsed.data;

    if (group.logoUrl) {
      await invalidateSignedUrlCache(group.logoUrl);
    }

    const updated = await db.group.update({
      where: { id: group.id },
      data: { logoUrl: logoStorageKey },
      select: { id: true, slug: true, name: true, logoUrl: true },
    });

    refreshSignedUrlCache(logoStorageKey).catch(() => {});

    logger.info("groups.logo.updated", { groupId: updated.id, userId: session.user.id });

    return NextResponse.json({ group: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    logger.error("groups.logo.update_failed", { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
