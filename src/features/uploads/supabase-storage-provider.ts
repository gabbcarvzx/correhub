/**
 * SupabaseStorageProvider — implementação enterprise do StorageProvider.
 *
 * v2.8 — Storage Hardening:
 * - Bucket privado (padrão: "correhub-private")
 * - Signed URLs temporárias (1h por padrão)
 * - Validação OWASP de upload (tamanho, MIME, sanitização)
 * - Path multi-tenant obrigatório
 * - Rate limit via Redis (5/min, 20/h por userId)
 * - AuditLog FILE_UPLOAD
 *
 * Requer variáveis de ambiente:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_STORAGE_BUCKET  (default: "correhub-private")
 */

import type { StorageProvider, UploadInput, UploadResult } from "@/features/uploads/storage-provider";
import { validateUpload, getMaxUploadSize } from "@/features/uploads/upload-validator";
import { buildStoragePath, parseStorageKey } from "@/features/uploads/path-builder";
import { createServiceClient } from "@/lib/supabase/client";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAuditLog } from "@/features/admin/data/audit-log-repository";
import { auth } from "@/auth";
import { logger, getLogger } from "@/features/observability/logger";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const DEFAULT_SIGNED_URL_EXPIRY = 3600; // 1 hora em segundos
const RATE_LIMIT_PER_MINUTE = 5;
const RATE_LIMIT_PER_HOUR = 20;

const SCOPE_TYPE = "user";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "correhub-private";
}

/**
 * Retorna o userId da sessão atual.
 * Usado para logging e rate limit.
 */
async function getUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      logger.debug("storage.auth.no_session");
    }
    return session?.user?.id ?? null;
  } catch (error) {
    logger.warn("storage.auth.error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export class SupabaseStorageProvider implements StorageProvider {
  private client: ReturnType<typeof createServiceClient> | null = null;

  private getClient() {
    if (!this.client) {
      this.client = createServiceClient();
    }
    return this.client;
  }

  /**
   * Faz upload validado de um arquivo.
   *
   * Pipeline:
   * 1. Valida tamanho, MIME, nome
   * 2. Verifica rate limit (5/min, 20/h por userId)
   * 3. Gera path multi-tenant
   * 4. Faz upload para bucket privado
   * 5. Gera signed URL
   * 6. Cria AuditLog FILE_UPLOAD
   */
  async upload(input: UploadInput): Promise<UploadResult> {
    const startTime = Date.now();
    const log = getLogger({ tenantId: input.tenantId });
    const userId = await getUserId();
    const bucket = getBucketName();

    // 1. Validação OWASP
    const validation = validateUpload({
      originalName: input.originalName,
      mimeType: input.contentType,
      sizeBytes: input.body.length,
      body: input.body,
    });

    if (!validation.valid) {
      logger.security("storage.upload.validation_failed", {
        userId,
        tenantId: input.tenantId,
        error: validation.error,
        originalName: input.originalName,
        mimeType: input.contentType,
        sizeBytes: input.body.length,
      });
      throw new Error(validation.error!);
    }

    // 2. Rate limit (se userId disponível)
    if (userId) {
      const allowed = await this.checkUploadRateLimit(userId);
      if (!allowed) {
        throw new Error(
          "Limite de uploads excedido. Máximo de 5 uploads por minuto ou 20 por hora."
        );
      }
    }

    // 3. Gera path multi-tenant
    const storageKey = buildStoragePath({
      tenantId: input.tenantId,
      entityType: input.entityType,
      entityId: input.entityId,
      fileName: validation.sanitizedFileName,
    });

    // 4. Upload para bucket privado
    const supabase = this.getClient();
    // mimeType está garantido porque validation.valid === true
    const contentType = validation.mimeType!;

    log.info("storage.upload.start", {
      bucket,
      storageKey,
      contentType,
      sizeBytes: input.body.length,
    });

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storageKey, input.body, {
        contentType,
        upsert: true,
        duplex: "half",
      });

    if (uploadError) {
      logger.error("storage.upload.error", {
        bucket,
        storageKey,
        error: uploadError.message,
        userId,
        tenantId: input.tenantId,
      });
      throw new Error(`Falha ao fazer upload: ${uploadError.message}`);
    }

    // 5. Gera signed URL
    const expiresIn = DEFAULT_SIGNED_URL_EXPIRY;
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, expiresIn);

    if (signedError || !signedData) {
      logger.error("storage.upload.signed_url_error", {
        bucket,
        storageKey,
        error: signedError?.message ?? "No signed URL returned",
      });
      throw new Error("Falha ao gerar URL de acesso ao arquivo.");
    }

    const durationMs = Date.now() - startTime;

    // 6. AuditLog FILE_UPLOAD
    try {
      await createAuditLog({
        tenantId: input.tenantId,
        actorUserId: userId ?? input.tenantId,
        entityType: "FILE_UPLOAD",
        entityId: storageKey,
        action: "UPLOAD",
        metadata: {
          fileSize: input.body.length,
          mimeType: contentType,
          storageKey,
          entityType: input.entityType,
          entityId: input.entityId,
          durationMs,
        },
      });
    } catch (auditError) {
      // Audit failure não deve quebrar o upload
      logger.error("storage.upload.audit_failed", {
        error: String(auditError),
        storageKey,
      });
    }

    log.info("storage.upload.success", {
      bucket,
      storageKey,
      durationMs,
      fileSize: input.body.length,
    });

    return {
      storageKey,
      signedUrl: signedData.signedUrl,
      expiresIn,
    };
  }

  /**
   * Remove um arquivo do storage.
   * Valida o storage key antes de remover.
   */
  async remove(storageKey: string): Promise<void> {
    const bucket = getBucketName();

    // Valida formato do storage key
    const parsed = parseStorageKey(storageKey);
    if (!parsed) {
      logger.security("storage.remove.invalid_key", { storageKey });
      throw new Error("Storage key inválido. Use o formato tenants/{tenantId}/{type}/{id}/{file}.");
    }

    logger.info("storage.remove.start", { bucket, storageKey });

    const supabase = this.getClient();
    const { error } = await supabase.storage.from(bucket).remove([storageKey]);

    if (error) {
      logger.error("storage.remove.error", {
        bucket,
        storageKey,
        error: error.message,
      });
      throw new Error(`Falha ao remover arquivo: ${error.message}`);
    }

    // AuditLog FILE_UPLOAD — DELETE
    try {
      const userId = await getUserId();
      await createAuditLog({
        tenantId: parsed.tenantId,
        actorUserId: userId ?? parsed.tenantId,
        entityType: "FILE_UPLOAD",
        entityId: storageKey,
        action: "DELETE",
        metadata: {
          storageKey,
          entityType: parsed.entityType,
          entityId: parsed.entityId,
        },
      });
    } catch (auditError) {
      logger.error("storage.remove.audit_failed", {
        error: String(auditError),
        storageKey,
      });
    }

    logger.info("storage.remove.success", { bucket, storageKey });
  }

  /**
   * Gera uma signed URL temporária para acesso a um arquivo.
   */
  async getSignedUrl(input: {
    storageKey: string;
    expiresIn?: number;
  }): Promise<{ signedUrl: string; expiresIn: number }> {
    const { storageKey, expiresIn = DEFAULT_SIGNED_URL_EXPIRY } = input;
    const bucket = getBucketName();

    const supabase = this.getClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, expiresIn);

    if (error || !data) {
      logger.error("storage.signed_url.error", {
        bucket,
        storageKey,
        error: error?.message ?? "No signed URL returned",
      });
      throw new Error("Falha ao gerar URL de acesso ao arquivo.");
    }

    return { signedUrl: data.signedUrl, expiresIn };
  }

  // ---------------------------------------------------------------------------
  // Rate limit helpers
  // ---------------------------------------------------------------------------

  /**
   * Verifica rate limit de upload para um userId.
   * 2 camadas: 5/min e 20/hora.
   * Retorna false se excedido.
   */
  private async checkUploadRateLimit(userId: string): Promise<boolean> {
    // 5 uploads por minuto
    const perMinute = await checkRateLimit({
      identifier: `upload:user:${userId}`,
      config: {
        windowMs: 60 * 1000,
        maxRequests: RATE_LIMIT_PER_MINUTE,
      },
      scope: SCOPE_TYPE,
      storeName: "upload",
    });

    if (!perMinute.allowed) {
      logger.security("storage.rate_limit.per_minute_exceeded", {
        userId,
        limit: RATE_LIMIT_PER_MINUTE,
      });
      return false;
    }

    // 20 uploads por hora
    const perHour = await checkRateLimit({
      identifier: `upload:hour:${userId}`,
      config: {
        windowMs: 60 * 60 * 1000,
        maxRequests: RATE_LIMIT_PER_HOUR,
      },
      scope: SCOPE_TYPE,
      storeName: "upload-hour",
    });

    if (!perHour.allowed) {
      logger.security("storage.rate_limit.per_hour_exceeded", {
        userId,
        limit: RATE_LIMIT_PER_HOUR,
      });
      return false;
    }

    return true;
  }
}
