import { NextResponse } from "next/server";
import { z } from "zod";
import { generateRankingSnapshot } from "@/features/rankings/services/rankings-service";
import { logger } from "@/features/observability/logger";

/**
 * POST /api/internal/ranking/generate
 *
 * Gera snapshot de ranking para o período especificado.
 * Protegido por header X-CRON-SECRET.
 *
 * Compatível com Vercel Cron e Supabase Edge Functions.
 *
 * Headers:
 *   X-CRON-SECRET: deve corresponder a CRON_SECRET do ambiente
 *
 * Body (JSON):
 *   periodType: "weekly" | "monthly"
 *
 * Exemplo Vercel Cron (vercel.json):
 *   {
 *     "crons": [
 *       { "path": "/api/internal/ranking/generate", "schedule": "59 23 * * 0" }
 *     ]
 *   }
 *
 * Resposta (200):
 *   { success: true, tenantId, periodKey, entriesCount }
 */
const generateSchema = z.object({
  periodType: z.enum(["weekly", "monthly"]),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Verifica secret interno
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");

  if (!cronSecret || providedSecret !== cronSecret) {
    logger.warn("internal.ranking.unauthorized", {
      hasSecret: !!cronSecret,
      hasProvided: !!providedSecret,
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { periodType } = parsed.data;
    const result = await generateRankingSnapshot(periodType);

    logger.info("internal.ranking.snapshot_generated", {
      tenantId: result.tenantId,
      periodType,
      periodKey: result.periodKey,
      entriesCount: result.entriesCount,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error("internal.ranking.generate_failed", { error: String(error) });
    return NextResponse.json(
      { error: "Falha ao gerar snapshot de ranking." },
      { status: 500 }
    );
  }
}
