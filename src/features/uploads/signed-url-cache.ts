/**
 * Signed URL Cache — cache de signed URLs no Redis para evitar
 * chamadas desnecessárias ao Supabase Storage a cada page load.
 *
 * Estratégia:
 * - Cache key: `signed-url:{bucket}:{storageKey}`
 * - Valor: JSON com `{ signedUrl, expiresAt }` (timestamp da expiração real)
 * - TTL: 50 minutos (para signed URLs de 1h, renovamos com 10min de margem)
 * - Se cache hit e ainda válido → retorna do cache
 * - Se cache miss ou próximo de expirar → gera nova signed URL, salva no cache
 * - Invalidação explícita quando o avatar é alterado
 *
 * Depende de:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Redis } from "@upstash/redis";
import { createServiceClient } from "@/lib/supabase/client";
import { logger } from "@/features/observability/logger";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Duração da signed URL em segundos */
const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 hora

/** TTL do cache no Redis em segundos (menor que a expiry da URL) */
const CACHE_TTL_SECONDS = 50 * 60; // 50 minutos

/** Margem de segurança em ms antes da expiry real para considerar expirado */
const EXPIRY_MARGIN_MS = 5 * 60 * 1000; // 5 minutos

const KEY_PREFIX = "signed-url";

// ---------------------------------------------------------------------------
// Redis client (lazy, mesmo padrão do rate-limit-redis.ts)
// ---------------------------------------------------------------------------

function createRedisClient(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for signed URL caching."
    );
  }

  return new Redis({ url, token });
}

let redisClient: Redis | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
}

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface CachedSignedUrl {
  signedUrl: string;
  expiresAt: number; // timestamp ms
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCacheKey(bucket: string, storageKey: string): string {
  return `${KEY_PREFIX}:${bucket}:${storageKey}`;
}

function getBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "correhub-private";
}

// ---------------------------------------------------------------------------
// Função principal
// ---------------------------------------------------------------------------

/**
 * Retorna uma signed URL para o storageKey, usando cache Redis.
 *
 * 1. Tenta buscar do Redis
 * 2. Se cache hit e válido (expira em > 5min) → retorna do cache
 * 3. Se cache miss ou próximo de expirar → gera nova do Supabase, cacheia, retorna
 *
 * @param storageKey - Key do arquivo no bucket
 * @returns signed URL ou null se não for possível gerar
 */
export async function getCachedSignedUrl(
  storageKey: string | null
): Promise<string | null> {
  if (!storageKey) return null;

  const bucket = getBucketName();
  const cacheKey = buildCacheKey(bucket, storageKey);
  const now = Date.now();

  try {
    // 1. Tenta cache
    const redis = getRedis();
    const cached = await redis.get<CachedSignedUrl>(cacheKey);

    if (cached && cached.expiresAt > now + EXPIRY_MARGIN_MS && cached.signedUrl) {
      logger.debug("signed_url.cache.hit", { storageKey, cacheKey });
      return cached.signedUrl;
    }

    if (cached) {
      logger.info("signed_url.cache.expired", {
        storageKey,
        expiresAt: new Date(cached.expiresAt).toISOString(),
      });
    }

    // 2. Gera nova signed URL
    const supabase = createServiceClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storageKey, SIGNED_URL_EXPIRY_SECONDS);

    if (error || !data) {
      logger.error("signed_url.cache.generate_failed", {
        storageKey,
        error: error?.message ?? "No signed URL returned",
      });
      // Se tínhamos cache mesmo que expirado, usa como fallback
      if (cached?.signedUrl) {
        logger.warn("signed_url.cache.fallback", { storageKey });
        return cached.signedUrl;
      }
      return null;
    }

    // 3. Salva no cache
    const cacheEntry: CachedSignedUrl = {
      signedUrl: data.signedUrl,
      expiresAt: now + SIGNED_URL_EXPIRY_SECONDS * 1000,
    };

    await redis.set(cacheKey, cacheEntry, { ex: CACHE_TTL_SECONDS });

    logger.debug("signed_url.cache.miss", {
      storageKey,
      ttlSeconds: CACHE_TTL_SECONDS,
    });

    return data.signedUrl;
  } catch (error) {
    // Se Redis falhar, tenta gerar signed URL direto
    logger.error("signed_url.cache.redis_error", {
      storageKey,
      error: error instanceof Error ? error.message : String(error),
    });

    try {
      const supabase = createServiceClient();
      const { data } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storageKey, SIGNED_URL_EXPIRY_SECONDS);
      return data?.signedUrl ?? null;
    } catch {
      return null;
    }
  }
}

/**
 * Invalida o cache de signed URL para um storageKey.
 * Deve ser chamada quando o arquivo é alterado/substituído.
 */
export async function invalidateSignedUrlCache(
  storageKey: string | null
): Promise<void> {
  if (!storageKey) return;

  const bucket = getBucketName();
  const cacheKey = buildCacheKey(bucket, storageKey);

  try {
    const redis = getRedis();
    await redis.del(cacheKey);
    logger.debug("signed_url.cache.invalidated", { storageKey });
  } catch (error) {
    logger.error("signed_url.cache.invalidate_failed", {
      storageKey,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Invalida o cache e pré-popula com uma nova signed URL.
 * Usado após upload para cachear imediatamente a URL.
 */
export async function refreshSignedUrlCache(
  storageKey: string | null
): Promise<string | null> {
  if (!storageKey) return null;

  // Invalida primeiro
  await invalidateSignedUrlCache(storageKey);

  // Gera nova e cacheia
  return getCachedSignedUrl(storageKey);
}
