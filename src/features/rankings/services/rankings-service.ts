import { findLatestCityRanking } from "@/features/rankings/data/rankings-repository";
import type { RankingCardModel } from "@/features/shared/types";
import { db } from "@/lib/db";
import { getCurrentTenant } from "@/lib/security/tenant";
import { logger, getLogger } from "@/features/observability/logger";

// ---------------------------------------------------------------------------
// Ranking em tempo real (agregação direta no CheckIn)
// ---------------------------------------------------------------------------

export interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  totalKm: number;
  totalRuns: number;
  avgKmPerRun: number;
}

export interface RankingResult {
  period: "weekly" | "monthly";
  generatedAt: string;
  entries: RankingEntry[];
}

/**
 * Ranking semanal (últimos 7 dias) por KM total.
 */
export async function getWeeklyRanking(
  tenantId: string,
  limit: number = 50
): Promise<RankingResult> {
  const log = getLogger({ tenantId, period: "weekly" });
  const startTime = Date.now();
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const entries = await getRankingByPeriod(tenantId, since, limit);

  log.info("ranking.weekly.generated", {
    entriesCount: entries.length,
    durationMs: Date.now() - startTime,
  });

  return { period: "weekly", generatedAt: new Date().toISOString(), entries };
}

/**
 * Ranking mensal (últimos 30 dias) por KM total.
 */
export async function getMonthlyRanking(
  tenantId: string,
  limit: number = 50
): Promise<RankingResult> {
  const log = getLogger({ tenantId, period: "monthly" });
  const startTime = Date.now();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const entries = await getRankingByPeriod(tenantId, since, limit);

  log.info("ranking.monthly.generated", {
    entriesCount: entries.length,
    durationMs: Date.now() - startTime,
  });

  return { period: "monthly", generatedAt: new Date().toISOString(), entries };
}

/**
 * Ranking semanal filtrado por grupo.
 */
export async function getWeeklyRankingByGroup(
  tenantId: string,
  groupId: string,
  limit: number = 50
): Promise<RankingResult> {
  const log = getLogger({ tenantId, groupId, period: "weekly" });
  const startTime = Date.now();
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const entries = await getRankingByPeriod(tenantId, since, limit, groupId);

  log.info("ranking.weekly.group.generated", {
    entriesCount: entries.length,
    durationMs: Date.now() - startTime,
  });

  return { period: "weekly", generatedAt: new Date().toISOString(), entries };
}

/**
 * Ranking mensal filtrado por grupo.
 */
export async function getMonthlyRankingByGroup(
  tenantId: string,
  groupId: string,
  limit: number = 50
): Promise<RankingResult> {
  const log = getLogger({ tenantId, groupId, period: "monthly" });
  const startTime = Date.now();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const entries = await getRankingByPeriod(tenantId, since, limit, groupId);

  log.info("ranking.monthly.group.generated", {
    entriesCount: entries.length,
    durationMs: Date.now() - startTime,
  });

  return { period: "monthly", generatedAt: new Date().toISOString(), entries };
}

/**
 * Query segura de ranking com parâmetros vinculados.
 *
 * A junção com RunEvent para filtro por grupo é feita via condicional
 * de WHERE em vez de JOIN dinâmico, evitando SQL injection.
 */
async function getRankingByPeriod(
  tenantId: string,
  since: Date,
  limit: number,
  groupId?: string
): Promise<RankingEntry[]> {
  if (groupId) {
    const raw = await db.$queryRaw<
      Array<{ userId: string; totalKm: number; totalRuns: bigint }>
    >`
      SELECT
        ci."userId",
        COALESCE(SUM(ci."kmReported"), 0) as "totalKm",
        COUNT(ci.id)::bigint as "totalRuns"
      FROM "CheckIn" ci
      JOIN "RunEvent" re ON re.id = ci."runEventId"
      WHERE ci."tenantId" = ${tenantId}
        AND re."groupId" = ${groupId}
        AND ci."checkedInAt" >= ${since}
        AND ci."deletedAt" IS NULL
      GROUP BY ci."userId"
      ORDER BY "totalKm" DESC, "totalRuns" DESC
      LIMIT ${limit}
    `;

    return buildRankingEntries(raw);
  }

  const raw = await db.$queryRaw<
    Array<{ userId: string; totalKm: number; totalRuns: bigint }>
  >`
    SELECT
      ci."userId",
      COALESCE(SUM(ci."kmReported"), 0) as "totalKm",
      COUNT(ci.id)::bigint as "totalRuns"
    FROM "CheckIn" ci
    WHERE ci."tenantId" = ${tenantId}
      AND ci."checkedInAt" >= ${since}
      AND ci."deletedAt" IS NULL
    GROUP BY ci."userId"
    ORDER BY "totalKm" DESC, "totalRuns" DESC
    LIMIT ${limit}
  `;

  return buildRankingEntries(raw);
}

async function buildRankingEntries(
  raw: Array<{ userId: string; totalKm: number; totalRuns: bigint }>
): Promise<RankingEntry[]> {
  if (raw.length === 0) return [];

  // Batch load user names (evita N+1)
  const userIds = raw.map((r) => r.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  // Monta resultado com tratamento de empates
  let currentPosition = 0;
  let previousKm: number | null = null;

  return raw.map((row, index) => {
    if (row.totalKm !== previousKm) {
      currentPosition = index + 1;
    }
    previousKm = row.totalKm;

    return {
      position: currentPosition,
      userId: row.userId,
      name: userMap.get(row.userId) ?? "Corredor",
      totalKm: Number(row.totalKm.toFixed(1)),
      totalRuns: Number(row.totalRuns),
      avgKmPerRun:
        Number(row.totalRuns) > 0
          ? Number((row.totalKm / Number(row.totalRuns)).toFixed(1))
          : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Dashboard metrics — agregação única com FILTER clauses
// ---------------------------------------------------------------------------

export async function getUserDashboardMetrics(
  tenantId: string,
  userId: string
) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const raw = await db.$queryRaw<
    Array<{
      totalKmAllTime: number;
      totalKm30d: number;
      totalKm7d: number;
      totalRuns30d: bigint;
      activeDays30d: bigint;
      last10Checkins: string | null;
    }>
  >`
    SELECT
      COALESCE(SUM(ci."kmReported") FILTER (WHERE ci."deletedAt" IS NULL), 0) as "totalKmAllTime",
      COALESCE(SUM(ci."kmReported") FILTER (WHERE ci."checkedInAt" >= ${thirtyDaysAgo} AND ci."deletedAt" IS NULL), 0) as "totalKm30d",
      COALESCE(SUM(ci."kmReported") FILTER (WHERE ci."checkedInAt" >= ${sevenDaysAgo} AND ci."deletedAt" IS NULL), 0) as "totalKm7d",
      COUNT(ci.id) FILTER (WHERE ci."checkedInAt" >= ${thirtyDaysAgo} AND ci."deletedAt" IS NULL)::bigint as "totalRuns30d",
      COUNT(DISTINCT ci."checkedInAt"::date) FILTER (WHERE ci."checkedInAt" >= ${thirtyDaysAgo} AND ci."deletedAt" IS NULL)::bigint as "activeDays30d",
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', ci2.id,
          'km', ci2."kmReported",
          'date', ci2."checkedInAt",
          'event', json_build_object('title', re."title")
        ) ORDER BY ci2."checkedInAt" DESC)
        FROM "CheckIn" ci2
        LEFT JOIN "RunEvent" re ON re.id = ci2."runEventId"
        WHERE ci2."userId" = ${userId}
          AND ci2."tenantId" = ${tenantId}
          AND ci2."deletedAt" IS NULL
        LIMIT 10),
        '[]'::json
      )::text as "last10Checkins"
    FROM "CheckIn" ci
    WHERE ci."userId" = ${userId}
      AND ci."tenantId" = ${tenantId}
  `;

  const row = raw[0];
  if (!row) {
    return {
      totalKmAllTime: 0, totalKm30d: 0, totalKm7d: 0,
      totalRuns30d: 0, activeDays30d: 0, weeklyAvgKm: 0,
      frequency: 0, last10Checkins: [],
    };
  }

  const totalKm30d = Number(row.totalKm30d);
  const activeDays30d = Number(row.activeDays30d);

  let last10Checkins: Array<{
    id: string; km: number | null; date: string;
    event: { title: string } | null;
  }> = [];

  try {
    if (row.last10Checkins && row.last10Checkins !== "[]") {
      last10Checkins = JSON.parse(row.last10Checkins);
    }
  } catch {
    logger.warn("dashboard.metrics_parse_error", { userId });
  }

  return {
    totalKmAllTime: Number(row.totalKmAllTime),
    totalKm30d,
    totalKm7d: Number(row.totalKm7d),
    totalRuns30d: Number(row.totalRuns30d),
    weeklyAvgKm: totalKm30d > 0 ? Number((totalKm30d / 4.3).toFixed(1)) : 0,
    activeDays30d,
    frequency: activeDays30d > 0 ? Number(((activeDays30d / 30) * 100).toFixed(0)) : 0,
    last10Checkins,
  };
}

export type UserDashboardMetrics = Awaited<ReturnType<typeof getUserDashboardMetrics>>;

// ---------------------------------------------------------------------------
// Snapshot-based ranking (compatibilidade + caching)
// ---------------------------------------------------------------------------

export async function listCityRanking(): Promise<RankingCardModel[]> {
  const tenant = await getCurrentTenant();
  const startTime = Date.now();

  const snapshots = await findLatestCityRanking(tenant.id);
  if (snapshots.length === 0) {
    logger.info("rankings.city.empty", { tenantId: tenant.id });
    return [];
  }

  const userIds = [...new Set(snapshots.map((e) => e.userId))];
  const groupIds = [...new Set(snapshots.map((e) => e.groupId).filter(Boolean))] as string[];

  const [users, groups] = await Promise.all([
    db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    }),
    groupIds.length > 0
      ? db.group.findMany({
          where: { id: { in: groupIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u.name]));
  const groupMap = new Map(groups.map((g) => [g.id, g.name]));

  const result = snapshots.map((entry) => ({
    position: entry.position,
    name: userMap.get(entry.userId) ?? "Corredor",
    group: entry.groupId ? (groupMap.get(entry.groupId) ?? "Sem grupo") : "Cidade",
    attendances: entry.attendanceCount,
    km: entry.kmTotal,
  }));

  logger.info("rankings.city.loaded", {
    tenantId: tenant.id,
    entriesCount: result.length,
    durationMs: Date.now() - startTime,
  });

  return result;
}

// ---------------------------------------------------------------------------
// RankingSnapshot — geração de snapshots periódicos
// ---------------------------------------------------------------------------

export type PeriodType = "weekly" | "monthly";

/**
 * Gera snapshot de ranking para o período especificado.
 * Upsert por (tenantId, periodType, periodKey, userId).
 * Idempotente — executar múltiplas vezes é seguro.
 */
export async function generateRankingSnapshot(periodType: PeriodType): Promise<{
  tenantId: string;
  periodKey: string;
  entriesCount: number;
}> {
  const tenant = await getCurrentTenant();
  const log = getLogger({ tenantId: tenant.id, periodType });
  const startTime = Date.now();

  const now = new Date();
  const periodKey = computePeriodKey(periodType, now);

  log.info("ranking.snapshot.start", { periodKey });

  // Determina a janela de tempo baseada no tipo de período
  let since: Date;
  if (periodType === "weekly") {
    since = new Date(now);
    since.setDate(since.getDate() - 7);
  } else {
    since = new Date(now);
    since.setDate(since.getDate() - 30);
  }

  // Busca ranking atual
  const ranking =
    periodType === "weekly"
      ? await getWeeklyRanking(tenant.id, 1000)
      : await getMonthlyRanking(tenant.id, 1000);

  if (ranking.entries.length === 0) {
    log.info("ranking.snapshot.no_data", { periodKey });
    return { tenantId: tenant.id, periodKey, entriesCount: 0 };
  }

  // Upsert em lote (protege contra duplicidade)
  let inserted = 0;
  const BATCH_SIZE = 50;

  for (let i = 0; i < ranking.entries.length; i += BATCH_SIZE) {
    const batch = ranking.entries.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map((entry) =>
        db.rankingSnapshot.upsert({
          where: {
            id: `snap-${tenant.id}-${periodKey}-${entry.userId}`,
          },
          update: {
            position: entry.position,
            kmTotal: entry.totalKm,
            attendanceCount: entry.totalRuns,
            score: entry.totalKm + entry.totalRuns * 0.5,
            groupId: null,
            createdAt: now,
          },
          create: {
            id: `snap-${tenant.id}-${periodKey}-${entry.userId}`,
            tenantId: tenant.id,
            periodType,
            periodKey,
            scopeType: "CITY",
            groupId: null,
            userId: entry.userId,
            position: entry.position,
            kmTotal: entry.totalKm,
            attendanceCount: entry.totalRuns,
            score: entry.totalKm + entry.totalRuns * 0.5,
          },
        })
      )
    );

    inserted += batch.length;
  }

  log.info("ranking.snapshot.complete", {
    periodKey,
    entriesCount: inserted,
    durationMs: Date.now() - startTime,
  });

  return { tenantId: tenant.id, periodKey, entriesCount: inserted };
}

/**
 * Computa a chave do período no formato YYYY-WW (semanal) ou YYYY-MM (mensal).
 */
function computePeriodKey(periodType: PeriodType, date: Date): string {
  const year = date.getFullYear();

  if (periodType === "monthly") {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  // Semanal: ISO week number
  const startOfYear = new Date(year, 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const week = Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${year}-${String(week).padStart(2, "0")}`;
}
