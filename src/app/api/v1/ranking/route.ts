import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTenant } from "@/lib/security/tenant";
import { checkRateLimit, getRateLimitHeaders, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import {
  getWeeklyRanking,
  getMonthlyRanking,
  getWeeklyRankingByGroup,
  getMonthlyRankingByGroup,
} from "@/features/rankings/services/rankings-service";
import { logger } from "@/features/observability/logger";

const rankingSchema = z.object({
  period: z.enum(["weekly", "monthly"]).default("weekly"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  groupId: z.string().min(1).optional(),
});

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ranking
 *
 * Parâmetros:
 *   period  - "weekly" | "monthly" (default: "weekly")
 *   limit   - 1-100 (default: 50)
 *   groupId - Opcional. Filtra por grupo específico.
 *
 * Exemplos:
 *   GET /api/v1/ranking
 *   GET /api/v1/ranking?period=monthly
 *   GET /api/v1/ranking?groupId=abc123
 *   GET /api/v1/ranking?period=monthly&groupId=abc123&limit=20
 *
 * Resposta (200):
 *   { period, generatedAt, entries: [{ position, userId, name, totalKm, totalRuns, avgKmPerRun }] }
 *
 * Segurança:
 *   - Rate limit via Redis (60 req/min por IP)
 *   - Multi-tenant isolado via getCurrentTenant()
 *   - Validação Zod de todos os parâmetros
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit({
    identifier: `ranking:${ip}`,
    config: RATE_LIMITS.API_GENERAL,
    scope: "ip",
    storeName: "ranking",
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const rawPeriod = searchParams.get("period") ?? "weekly";
    const rawLimit = searchParams.get("limit") ?? "50";
    const rawGroupId = searchParams.get("groupId") ?? undefined;

    const parsed = rankingSchema.safeParse({
      period: rawPeriod,
      limit: rawLimit,
      groupId: rawGroupId,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const tenant = await getCurrentTenant();
    const { period, limit, groupId } = parsed.data;

    let ranking;

    if (groupId) {
      ranking =
        period === "monthly"
          ? await getMonthlyRankingByGroup(tenant.id, groupId, limit)
          : await getWeeklyRankingByGroup(tenant.id, groupId, limit);
    } else {
      ranking =
        period === "monthly"
          ? await getMonthlyRanking(tenant.id, limit)
          : await getWeeklyRanking(tenant.id, limit);
    }

    logger.info("ranking.api.generated", {
      period,
      tenantId: tenant.id,
      groupId: groupId ?? null,
      entries: ranking.entries.length,
    });

    return NextResponse.json(ranking, {
      headers: {
        ...getRateLimitHeaders(rateLimit),
        "X-Ranking-Period": period,
        "X-Ranking-GroupId": groupId ?? "",
      },
    });
  } catch (error) {
    logger.error("ranking.api.failed", { error: String(error) });
    return NextResponse.json(
      { error: "Erro ao gerar ranking." },
      { status: 500 }
    );
  }
}
