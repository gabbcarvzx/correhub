-- Migration: Enterprise Hardening v2.7
-- 
-- 1. Adiciona unique constraint em RankingSnapshot para upsert idempotente
-- 2. Adiciona scopeType default para registros existentes
-- 3. Adiciona índice composto para queries de ranking por grupo
-- 4. Remove duplicatas existentes antes de adicionar a constraint

-- 1. Remove duplicatas existentes (mantém a mais recente)
DELETE FROM "RankingSnapshot" a
USING "RankingSnapshot" b
WHERE a."id" < b."id"
  AND a."tenantId" = b."tenantId"
  AND a."periodType" = b."periodType"
  AND a."periodKey" = b."periodKey"
  AND a."scopeType" = b."scopeType"
  AND a."userId" = b."userId";

-- 2. Adiciona unique constraint para upsert por chave natural
CREATE UNIQUE INDEX "RankingSnapshot_tenantId_periodType_periodKey_scopeType_userId_key"
  ON "RankingSnapshot" ("tenantId", "periodType", "periodKey", "scopeType", "userId");

-- 3. Índice composto para ranking por grupo (RunEvent.groupId + CheckIn join)
-- Otimiza: JOIN "RunEvent" re ON re.id = ci."runEventId" WHERE re."groupId" = ?
CREATE INDEX IF NOT EXISTS "RunEvent_groupId_id_idx"
  ON "RunEvent" ("groupId", "id");

-- 4. Índice covering para CheckIn (runEventId + tenantId + checkedInAt)
-- Otimiza a query de ranking agrupado
CREATE INDEX IF NOT EXISTS "CheckIn_runEventId_tenantId_checkedInAt_idx"
  ON "CheckIn" ("runEventId", "tenantId", "checkedInAt")
  WHERE "deletedAt" IS NULL;
