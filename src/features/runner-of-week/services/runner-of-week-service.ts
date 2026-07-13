import { db } from "@/lib/db";
import { logger } from "@/features/observability/logger";
import { getCachedSignedUrl } from "@/features/uploads/signed-url-cache";

export interface RunnerOfWeekResult {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  totalKm: number;
  currentStreak: number;
  level: string;
  weekStart: string;
  weekEnd: string;
}

/**
 * Retorna o destaque da semana (maior KM semanal).
 * Se não houver snapshot, busca em tempo real.
 */
export async function getRunnerOfTheWeek(
  tenantId: string
): Promise<RunnerOfWeekResult | null> {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  // Tenta buscar snapshot salvo primeiro
  const snapshot = await db.runnerOfTheWeek.findUnique({
    where: {
      tenantId_weekStart: { tenantId, weekStart },
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          level: true,
          currentStreak: true,
        },
      },
    },
  });

  if (snapshot) {
    const signedImage = snapshot.user.image
      ? await getCachedSignedUrl(snapshot.user.image)
      : null;

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      name: snapshot.user.name,
      image: signedImage,
      totalKm: snapshot.totalKm,
      currentStreak: snapshot.user.currentStreak,
      level: snapshot.user.level,
      weekStart: snapshot.weekStart.toISOString(),
      weekEnd: snapshot.weekEnd.toISOString(),
    };
  }

  // Fallback: calcula em tempo real
  return getWeeklyTopRunner(tenantId, weekStart, weekEnd);
}

/**
 * Busca o corredor com maior KM na semana atual.
 */
async function getWeeklyTopRunner(
  tenantId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<RunnerOfWeekResult | null> {
  const raw = await db.$queryRaw<
    Array<{
      userId: string;
      totalKm: number;
      name: string;
      image: string | null;
      level: string;
      currentStreak: number;
    }>
  >`
    SELECT
      ci."userId",
      COALESCE(SUM(ci."kmReported"), 0) as "totalKm",
      u.name,
      u.image,
      u.level,
      u."currentStreak"
    FROM "CheckIn" ci
    JOIN "User" u ON u.id = ci."userId"
    WHERE ci."tenantId" = ${tenantId}
      AND ci."checkedInAt" >= ${weekStart}
      AND ci."checkedInAt" <= ${weekEnd}
      AND ci."deletedAt" IS NULL
    GROUP BY ci."userId", u.name, u.image, u.level, u."currentStreak"
    ORDER BY "totalKm" DESC, u."currentStreak" DESC
    LIMIT 1
  `;

  if (raw.length === 0) return null;

  const winner = raw[0];
  const signedImage = winner.image
    ? await getCachedSignedUrl(winner.image)
    : null;

  return {
    id: `weekly-${weekStart.toISOString()}`,
    userId: winner.userId,
    name: winner.name,
    image: signedImage,
    totalKm: Number(winner.totalKm),
    currentStreak: winner.currentStreak,
    level: winner.level,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  };
}

/**
 * Gera/atualiza o snapshot do Runner of the Week.
 * Deve ser chamado por um cron job semanal.
 */
export async function generateRunnerOfTheWeekSnapshot(tenantId: string) {
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  const topRunner = await getWeeklyTopRunner(tenantId, weekStart, weekEnd);
  if (!topRunner) {
    logger.info("runner_of_week.no_data", { tenantId });
    return null;
  }

  const snapshot = await db.runnerOfTheWeek.upsert({
    where: {
      tenantId_weekStart: { tenantId, weekStart },
    },
    update: {
      userId: topRunner.userId,
      weekEnd,
      totalKm: topRunner.totalKm,
    },
    create: {
      tenantId,
      userId: topRunner.userId,
      weekStart,
      weekEnd,
      totalKm: topRunner.totalKm,
    },
  });

  logger.info("runner_of_week.generated", {
    tenantId,
    userId: topRunner.userId,
    totalKm: topRunner.totalKm,
  });

  return snapshot;
}

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  // Segunda-feira como início da semana
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekEnd(): Date {
  const start = getWeekStart();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}
