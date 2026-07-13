import { db } from "@/lib/db";
import { LEVEL_LABELS, LEVEL_ICONS } from "@/features/levels/services/level-service";
import { getStreakInfo } from "@/features/streaks/services/streak-service";
import { getCachedSignedUrl } from "@/features/uploads/signed-url-cache";
import type { RunnerLevel } from "@prisma/client";

export interface AthletePublicProfile {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  city: string | null;
  level: RunnerLevel;
  levelLabel: string;
  levelIcon: string;
  totalKm: number;
  totalAttendances: number;
  currentStreak: number;
  longestStreak: number;
  paceAvg: string | null;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt: string;
  }>;
  rankingPosition: number | null;
  monthlyKm: { date: string; km: number }[];
}

/**
 * Busca dados públicos de um atleta pelo username.
 * Usa o slug do tenant como namespace.
 * Apenas dados públicos — sem email, sem dados sensíveis.
 */
export async function getAthletePublicProfile(
  tenantId: string,
  username: string
): Promise<AthletePublicProfile | null> {
  const user = await db.user.findFirst({
    where: {
      tenantId,
      name: { equals: username, mode: "insensitive" },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      city: true,
      level: true,
      totalKm: true,
      totalAttendances: true,
      paceAvg: true,
    },
  });

  if (!user) return null;

  const [streakInfo, achievements, rankingPosition, monthlyKm] = await Promise.all([
    getStreakInfo(user.id),
    db.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        achievement: { select: { name: true, description: true, icon: true } },
      },
      orderBy: { earnedAt: "desc" },
    }),
    getAthleteRankingPosition(tenantId, user.id),
    getAthleteMonthlyKm(tenantId, user.id),
  ]);

  const avatarUrl = user.image ? await getCachedSignedUrl(user.image) : null;

  return {
    id: user.id,
    name: user.name,
    image: avatarUrl,
    bio: user.bio,
    city: user.city,
    level: user.level,
    levelLabel: LEVEL_LABELS[user.level],
    levelIcon: LEVEL_ICONS[user.level],
    totalKm: user.totalKm,
    totalAttendances: user.totalAttendances,
    currentStreak: streakInfo.currentStreak,
    longestStreak: streakInfo.longestStreak,
    paceAvg: user.paceAvg,
    achievements: achievements.map((ua) => ({
      id: ua.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      earnedAt: ua.earnedAt.toISOString(),
    })),
    rankingPosition,
    monthlyKm,
  };
}

/**
 * Busca a posição do atleta no ranking mensal da cidade.
 */
async function getAthleteRankingPosition(
  tenantId: string,
  userId: string
): Promise<number | null> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const raw = await db.$queryRaw<
    Array<{ position: number }>
  >`
    WITH ranking AS (
      SELECT
        ci."userId",
        COALESCE(SUM(ci."kmReported"), 0) as total_km,
        ROW_NUMBER() OVER (ORDER BY SUM(ci."kmReported") DESC) as position
      FROM "CheckIn" ci
      WHERE ci."tenantId" = ${tenantId}
        AND ci."checkedInAt" >= ${thirtyDaysAgo}
        AND ci."deletedAt" IS NULL
      GROUP BY ci."userId"
    )
    SELECT position FROM ranking WHERE "userId" = ${userId}
  `;

  return raw[0]?.position ?? null;
}

/**
 * Busca KM mensal dos últimos 30 dias para o gráfico.
 */
async function getAthleteMonthlyKm(
  tenantId: string,
  userId: string
): Promise<{ date: string; km: number }[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const raw = await db.$queryRaw<
    Array<{ date: string; km: number }>
  >`
    SELECT
      ci."checkedInAt"::date::text as date,
      COALESCE(SUM(ci."kmReported"), 0) as km
    FROM "CheckIn" ci
    WHERE ci."tenantId" = ${tenantId}
      AND ci."userId" = ${userId}
      AND ci."checkedInAt" >= ${thirtyDaysAgo}
      AND ci."deletedAt" IS NULL
    GROUP BY ci."checkedInAt"::date
    ORDER BY ci."checkedInAt"::date ASC
  `;

  return raw;
}
