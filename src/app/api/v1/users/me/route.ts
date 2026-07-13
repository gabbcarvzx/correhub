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

const updateUserSchema = z.object({
  avatarStorageKey: z.string().min(1, "Storage key inválido.").optional(),
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres.").max(100).optional(),
  city: z.string().min(2).max(100).optional(),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/users/me
// ---------------------------------------------------------------------------

/**
 * PATCH /api/v1/users/me
 *
 * Atualiza campos do perfil do usuário autenticado.
 *
 * Body (JSON):
 *   avatarStorageKey: string (opcional) — storage key do avatar no Supabase
 *   name: string (opcional)
 *   city: string (opcional)
 *
 * Resposta (200):
 *   { user: { id, name, email, image, city } }
 */
export async function PATCH(request: Request) {
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

    // 3. Body
    const body = await request.json().catch(() => ({}));
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Dados inválidos.";
      return NextResponse.json(
        { error: firstError, details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // 4. Monta dados para update
    const updateData: Record<string, unknown> = {};

    if (parsed.data.avatarStorageKey !== undefined) {
      updateData.image = parsed.data.avatarStorageKey;
    }
    if (parsed.data.name !== undefined) {
      updateData.name = parsed.data.name;
    }
    if (parsed.data.city !== undefined) {
      updateData.city = parsed.data.city;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar." },
        { status: 400 }
      );
    }

    const oldUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // 5. Atualiza no banco
    const user = await db.user.update({
      where: {
        id: session.user.id,
        tenantId: tenant.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        city: true,
      },
    });

    // 6. Invalida cache do avatar ANTIGO (se trocou de imagem)
    if (parsed.data.avatarStorageKey && oldUser?.image && oldUser.image !== parsed.data.avatarStorageKey) {
      await invalidateSignedUrlCache(oldUser.image);
    }

    // 7. Pré-cacheia signed URL do NOVO avatar
    if (parsed.data.avatarStorageKey) {
      // Fire-and-forget: não bloqueia a resposta
      refreshSignedUrlCache(parsed.data.avatarStorageKey).catch(() => {});
    }

    logger.info("users.me.updated", {
      userId: user.id,
      fields: Object.keys(updateData),
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    logger.error("users.me.update_failed", { error: message });

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
