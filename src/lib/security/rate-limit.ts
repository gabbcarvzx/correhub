/**
 * Rate limiting distribuído via Upstash Redis.
 *
 * Este arquivo substitui completamente a implementação em memória anterior.
 * Todas as funções mantêm a mesma assinatura, mas agora são assíncronas.
 *
 * Requer:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Se o Redis estiver indisponível, o sistema falha OPEN (permite requisições)
 * e loga o erro criticamente — nunca bloqueia tráfego por falha de infra.
 */

import {
  checkRateLimit as redisCheck,
  clearRateLimit as redisClear,
  checkRedisHealth,
  getClientIp,
  getRateLimitHeaders,
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitResult,
  type RateLimitScope,
} from "./rate-limit-redis";

// ---------------------------------------------------------------------------
// Re-export same API — now async
// ---------------------------------------------------------------------------
export { RATE_LIMITS, getClientIp, getRateLimitHeaders, checkRedisHealth };
export type { RateLimitConfig, RateLimitResult, RateLimitScope };

/**
 * Verifica rate limit via sliding window no Redis.
 * Antes: síncrono com Map em memória.
 * Agora: assíncrono com sorted set no Upstash Redis.
 */
export async function checkRateLimit(input: {
  identifier: string;
  config: RateLimitConfig;
  scope: RateLimitScope;
  storeName?: string;
}): Promise<RateLimitResult> {
  return redisCheck(input);
}

/**
 * Limpa manualmente as entradas de rate limit para um identificador.
 * Útil após login bem-sucedido.
 */
export async function clearRateLimit(input: {
  identifier: string;
  storeName?: string;
}): Promise<void> {
  return redisClear(input);
}
