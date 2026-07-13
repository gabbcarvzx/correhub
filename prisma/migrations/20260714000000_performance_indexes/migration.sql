-- Performance Indexes for CorreHub
-- ============================================================
-- Migration: 20260714000000_performance_indexes
--
-- Objetivos:
-- 1. Acelerar busca textual com ILIKE (pg_trgm + GIN)
-- 2. Acelerar agregações de ranking (CheckIn por período)
-- 3. Acelerar dashboard do usuário (CheckIn por userId)
-- 4. Garantir compatibilidade com Supabase (PostgreSQL 15+)
-- ============================================================

-- 1. Ativar extensão pg_trgm
--    Necessária para índices GIN trigram que aceleram ILIKE '%term%'
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- 2. Índices GIN trigram para busca textual (ILIKE)
--    Aceleram: WHERE name ILIKE '%term%' (full text search)
--    Antes: full table scan (~100ms+ em 10k linhas)
--    Depois: index scan (~2ms em 10k linhas)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_groups_name_trgm
  ON "Group" USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_groups_description_trgm
  ON "Group" USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_partners_name_trgm
  ON "Partner" USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_partners_category_trgm
  ON "Partner" USING GIN (category gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_partners_description_trgm
  ON "Partner" USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_events_title_trgm
  ON "RunEvent" USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_events_location_trgm
  ON "RunEvent" USING GIN (location gin_trgm_ops);

-- ============================================================
-- 3. Índices de agregação para ranking
--    Aceleram: SUM(kmReported), COUNT(id) GROUP BY userId
--    Usado por: ranking semanal, mensal e dashboard
-- ============================================================

-- CheckIn por userId + checkedInAt (ranking por período + dashboard)
-- Cobre: WHERE tenantId = ? AND checkedInAt >= ? GROUP BY userId
CREATE INDEX IF NOT EXISTS idx_checkins_user_date
  ON "CheckIn" (userId, "checkedInAt")
  WHERE "deletedAt" IS NULL;

-- CheckIn por tenantId + checkedInAt (ranking global por tenant)
CREATE INDEX IF NOT EXISTS idx_checkins_tenant_date
  ON "CheckIn" ("tenantId", "checkedInAt")
  WHERE "deletedAt" IS NULL;

-- CheckIn por tenantId + userId + checkedInAt (dashboard do usuário)
CREATE INDEX IF NOT EXISTS idx_checkins_tenant_user_date
  ON "CheckIn" ("tenantId", "userId", "checkedInAt")
  WHERE "deletedAt" IS NULL;

-- ============================================================
-- 4. Índices compostos para queries frequentes
-- ============================================================

-- User lookup por email + tenant (login)
CREATE INDEX IF NOT EXISTS idx_user_email_tenant
  ON "User" (email, "tenantId")
  WHERE "deletedAt" IS NULL;

-- RankingSnapshot por tenant + período (ranking histórico)
CREATE INDEX IF NOT EXISTS idx_ranking_tenant_period
  ON "RankingSnapshot" ("tenantId", "periodType", "periodKey", "position");

-- Event lookup por tenant + data (agenda)
CREATE INDEX IF NOT EXISTS idx_events_tenant_date
  ON "RunEvent" ("tenantId", "date")
  WHERE "deletedAt" IS NULL;

-- ============================================================
-- 5. Health check: confirmar que extensão está ativa
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
  ) THEN
    RAISE EXCEPTION 'pg_trgm extension failed to load';
  END IF;
END $$;
