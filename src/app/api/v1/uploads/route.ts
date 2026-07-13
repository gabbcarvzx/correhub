import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getAuthenticatedTenant } from "@/lib/security/tenant";
import { checkRateLimit, getRateLimitHeaders, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { getStorageProvider } from "@/features/uploads/storage-factory";
import { validateUpload } from "@/features/uploads/upload-validator";
import type { StorageEntityType } from "@/features/uploads/path-builder";
import { logger } from "@/features/observability/logger";

// ---------------------------------------------------------------------------
// Schemas de validação
// ---------------------------------------------------------------------------

const entityTypeSchema = z.enum(["users", "partners", "groups"]);

const uploadSchema = z.object({
  entityType: entityTypeSchema,
  entityId: z.string().min(1, "entityId é obrigatório."),
});

// ---------------------------------------------------------------------------
// Rate limit — upload API
// ---------------------------------------------------------------------------

const UPLOAD_API_LIMIT = {
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 10,      // 10 uploads por minuto por IP (antes da validação)
};

// ---------------------------------------------------------------------------
// POST /api/v1/uploads
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/uploads
 *
 * Faz upload de imagem com validação OWASP completa.
 *
 * Body (multipart/form-data):
 *   - entityType: "users" | "partners" | "groups"
 *   - entityId: string (userId, partnerId, groupId)
 *   - file: File (imagem)
 *
 * Resposta (201):
 *   {
 *     storageKey: "tenants/{tenantId}/{type}/{id}/{uuid}.png",
 *     signedUrl: "https://...",
 *     expiresIn: 3600,
 *     fileSize: 12345,
 *     mimeType: "image/png"
 *   }
 *
 * Erros:
 *   401 — Não autenticado
 *   400 — Validação falhou (arquivo inválido, campos inválidos)
 *   429 — Rate limit excedido
 *   413 — Arquivo muito grande
 *   500 — Erro interno
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  // -----------------------------------------------------------------------
  // 1. Rate limit por IP (camada externa)
  // -----------------------------------------------------------------------
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit({
    identifier: `uploads:${ip}`,
    config: UPLOAD_API_LIMIT,
    scope: "ip",
    storeName: "uploads-api",
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  try {
    // -----------------------------------------------------------------------
    // 2. Autenticação
    // -----------------------------------------------------------------------
    const session = await auth();
    if (!session?.user?.id) {
      logger.security("uploads.unauthorized", { ip });
      return NextResponse.json(
        { error: "Autenticação necessária para fazer upload." },
        { status: 401 }
      );
    }

    // -----------------------------------------------------------------------
    // 3. Multi-tenant: tenantId do contexto autenticado
    // -----------------------------------------------------------------------
    const tenant = await getAuthenticatedTenant();
    const userId = session.user.id;

    // -----------------------------------------------------------------------
    // 4. Parse do multipart/form-data
    // -----------------------------------------------------------------------
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "Body inválido. Envie multipart/form-data." },
        { status: 400 }
      );
    }

    // 4a. Valida campos textuais com Zod
    const rawEntityType = formData.get("entityType") as string | null;
    const rawEntityId = formData.get("entityId") as string | null;

    const parsed = uploadSchema.safeParse({
      entityType: rawEntityType,
      entityId: rawEntityId,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Campos inválidos.";
      return NextResponse.json(
        { error: firstError, details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { entityType, entityId } = parsed.data;

    // 4b. Valida se entityId corresponde ao usuário logado (quando tipo "users")
    if (entityType === "users" && entityId !== userId) {
      logger.security("uploads.entity_id_mismatch", {
        userId,
        requestedEntityId: entityId,
      });
      return NextResponse.json(
        { error: "Você só pode fazer upload de avatar para seu próprio usuário." },
        { status: 403 }
      );
    }

    // 4c. Extrai o arquivo
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado. Envie o campo 'file' com a imagem." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "Arquivo vazio." },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // 5. Validação OWASP completa (tamanho, MIME, nome, extensão)
    // -----------------------------------------------------------------------
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const validation = validateUpload({
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      body: fileBuffer,
    });

    if (!validation.valid) {
      logger.security("uploads.validation_failed", {
        userId,
        tenantId: tenant.id,
        error: validation.error,
        originalName: file.name,
        mimeType: file.type,
      });

      return NextResponse.json(
        { error: validation.error! },
        { status: 400 }
      );
    }

    // -----------------------------------------------------------------------
    // 6. Upload via SupabaseStorageProvider
    // -----------------------------------------------------------------------
    const storage = getStorageProvider();

    const result = await storage.upload({
      tenantId: tenant.id,
      entityType: entityType as StorageEntityType,
      entityId,
      originalName: file.name,
      body: fileBuffer,
      contentType: validation.mimeType!,
    });

    const durationMs = Date.now() - startTime;

    logger.info("uploads.success", {
      userId,
      tenantId: tenant.id,
      storageKey: result.storageKey,
      fileSize: file.size,
      mimeType: validation.mimeType,
      entityType,
      entityId,
      durationMs,
    });

    // -----------------------------------------------------------------------
    // 7. Resposta
    // -----------------------------------------------------------------------
    return NextResponse.json(
      {
        storageKey: result.storageKey,
        signedUrl: result.signedUrl,
        expiresIn: result.expiresIn,
        fileSize: file.size,
        mimeType: validation.mimeType,
      },
      {
        status: 201,
        headers: {
          ...getRateLimitHeaders(rateLimit),
          "X-Upload-Key": result.storageKey,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno do servidor.";
    const status =
      message.includes("Limite de uploads excedido") ? 429
      : message.includes("não configurado") || message.includes("Configure um provedor") ? 500
      : message.includes("Falha ao fazer upload") ? 502
      : 500;

    logger.error("uploads.failed", {
      error: message,
      durationMs: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
