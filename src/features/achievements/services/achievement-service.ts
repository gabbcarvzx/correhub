import { db } from "@/lib/db";
import { logger } from "@/features/observability/logger";

// Tipo do cliente de transaction do Prisma
type TxClient = Omit<typeof db, "$transaction" | "$connect" | "$disconnect" | "$on" | "$extends">;

/**
 * Definição das conquistas disponíveis.
 * Cada conquista tem uma ruleType e ruleValue para verificação automática.
 */
export interface AchievementDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  ruleType: "total_km" | "total_checkins" | "streak_days";
  ruleValue: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    code: "KM_50",
    name: "Meio Centenário",
    description: "Acumule 50 km em check-ins",
    icon: "🏅",
    ruleType: "total_km",
    ruleValue: 50,
  },
  {
    code: "KM_100",
    name: "Centenário",
    description: "Acumule 100 km em check-ins",
    icon: "🥇",
    ruleType: "total_km",
    ruleValue: 100,
  },
  {
    code: "CHECKIN_10",
    name: "Dedicado",
    description: "Complete 10 check-ins",
    icon: "📋",
    ruleType: "total_checkins",
    ruleValue: 10,
  },
  {
    code: "CHECKIN_30",
    name: "Veterano",
    description: "Complete 30 check-ins",
    icon: "⭐",
    ruleType: "total_checkins",
    ruleValue: 30,
  },
  {
    code: "STREAK_7",
    name: "Semana Intensa",
    description: "Mantenha uma streak de 7 dias",
    icon: "🔥",
    ruleType: "streak_days",
    ruleValue: 7,
  },
  {
    code: "STREAK_30",
    name: "Mês de Ferro",
    description: "Mantenha uma streak de 30 dias",
    icon: "💎",
    ruleType: "streak_days",
    ruleValue: 30,
  },
];

/**
 * Verifica e desbloqueia conquistas automaticamente após um check-in.
 * Executado dentro da transaction do check-in.
 * Retorna lista de achievements desbloqueados (para notificação).
 */
export async function unlockAchievements(
  tx: TxClient,
  input: {
    tenantId: string;
    userId: string;
    totalKm: number;
    totalCheckins: number;
    currentStreak: number;
  }
): Promise<string[]> {
  const { tenantId, userId, totalKm, totalCheckins, currentStreak } = input;

  // Busca conquistas já desbloqueadas pelo usuário
  const existing = await tx.userAchievement.findMany({
    where: { userId, tenantId },
    select: { achievementId: true },
  });
  const existingIds = new Set(existing.map((e) => e.achievementId));

  // Busca definições de conquistas do tenant
  const allAchievements = await tx.achievement.findMany({
    where: { tenantId },
  });

  const unlocked: string[] = [];

  for (const achievement of allAchievements) {
    if (existingIds.has(achievement.id)) continue;

    let earned = false;

    switch (achievement.ruleType) {
      case "total_km":
        earned = totalKm >= achievement.ruleValue;
        break;
      case "total_checkins":
        earned = totalCheckins >= achievement.ruleValue;
        break;
      case "streak_days":
        earned = currentStreak >= achievement.ruleValue;
        break;
    }

    if (earned) {
      await tx.userAchievement.create({
        data: {
          tenantId,
          userId,
          achievementId: achievement.id,
        },
      });
      unlocked.push(achievement.name);

      logger.info("achievement.unlocked", {
        userId,
        achievementCode: achievement.code,
        achievementName: achievement.name,
      });
    }
  }

  return unlocked;
}

/**
 * Seed achievements para um tenant (chamado no setup inicial ou admin).
 */
export async function seedAchievements(tenantId: string) {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await db.achievement.upsert({
      where: {
        tenantId_code: { tenantId, code: def.code },
      },
      update: {
        name: def.name,
        description: def.description,
        icon: def.icon,
        ruleType: def.ruleType,
        ruleValue: def.ruleValue,
      },
      create: {
        tenantId,
        code: def.code,
        name: def.name,
        description: def.description,
        icon: def.icon,
        ruleType: def.ruleType,
        ruleValue: def.ruleValue,
      },
    });
  }
}
