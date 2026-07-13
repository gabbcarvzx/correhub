import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getAuthenticatedTenant } from "@/lib/security/tenant";
import { db } from "@/lib/db";
import { invalidateSignedUrlCache, refreshSignedUrlCache } from "@/features/uploads/signed-url-cache";
import { logger } from "@/features/observability/logger";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const updatePartnerSchema = z.object({
  logoStorageKey: z.string().min(1, "Storage key inválido."),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/partners/[slug]
// ---------------------------------------------------------------------------

/**
 * PATCH /api/v1/partners/[slug]
 *
 * Atualiza o logo de um parceiro. Apenas o owner do parceiro ou admin pode alterar.
 *
 * Body (JSON):
 *   logoStorageKey: string — storage key do logo no Supabase
 *
 * Resposta (200):
 *   { partner: { id, slug, name, logoUrl } }
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    // 1. Autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Autenticação necessária." },
        { status: 401 }
      );
    }

    // 2. Multi-tenant
    const tenant = await getAuthenticatedTenant();
    const { slug } = await context.params;

    // 3. Busca o partner + verifica ownership
    const partner = await db.partner.findFirst({
      where: {
        tenantId: tenant.id,
        slug,
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        ownerUserId: true,
      },
    });

    if (!partner) {
      return NextResponse.json(
        { error: "Parceiro não encontrado." },
        { status: 404 }
      );
    }

    // 4. Verifica permissão: owner do partner ou admin
    const isOwner = partner.ownerUserId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      logger.security("partners.logo.unauthorized", {
        userId: session.user.id,
        partnerSlug: slug,
        partnerOwnerId: partner.ownerUserId,
      });
      return NextResponse.json(
        { error: "Você não tem permissão para alterar o logo deste parceiro." },
        { status: 403 }
      );
    }

    // 5. Body
    const body = await request.json().catch(() => ({}));
    const parsed = updatePartnerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { logoStorageKey } = parsed.data;

    // 6. Invalida cache do logo antigo
    if (partner.logoUrl) {
      await invalidateSignedUrlCache(partner.logoUrl);
    }

    // 7. Atualiza no banco
    const updated = await db.partner.update({
      where: { id: partner.id },
      data: { logoUrl: logoStorageKey },
      select: { id: true, slug: true, name: true, logoUrl: true },
    });

    // 8. Pré-cacheia signed URL do novo logo
    refreshSignedUrlCache(logoStorageKey).catch(() => {});

    logger.info("partners.logo.updated", {
      partnerId: updated.id,
      userId: session.user.id,
    });

    return NextResponse.json({ partner: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    logger.error("partners.logo.update_failed", { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
