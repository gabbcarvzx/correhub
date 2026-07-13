import { db } from "@/lib/db";
import { logger } from "@/features/observability/logger";

type NotificationType =
  | "level_up"
  | "achievement_unlock"
  | "streak_milestone"
  | "ranking_change";

/**
 * Cria uma notificação para o usuário.
 */
export async function createNotification(input: {
  tenantId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}) {
  const notification = await db.notification.create({
    data: {
      tenantId: input.tenantId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl ?? null,
    },
  });

  logger.info("notification.created", {
    userId: input.userId,
    type: input.type,
    notificationId: notification.id,
  });

  return notification;
}

/**
 * Cria notificação de subida de nível.
 */
export async function notifyLevelUp(input: {
  tenantId: string;
  userId: string;
  fromLevel: string;
  toLevel: string;
}) {
  const levelLabels: Record<string, string> = {
    BEGINNER: "Iniciante",
    RUNNER: "Runner",
    ATHLETE: "Atleta",
    ELITE: "Elite",
    LEGEND: "Lenda",
  };

  return createNotification({
    tenantId: input.tenantId,
    userId: input.userId,
    type: "level_up",
    title: "🎉 Novo nível alcançado!",
    message: `Você subiu de ${levelLabels[input.fromLevel] ?? input.fromLevel} para ${levelLabels[input.toLevel] ?? input.toLevel}! Continue correndo para alcançar o próximo nível.`,
    actionUrl: "/perfil",
  });
}

/**
 * Cria notificação de conquista desbloqueada.
 */
export async function notifyAchievementUnlocked(input: {
  tenantId: string;
  userId: string;
  achievementName: string;
}) {
  return createNotification({
    tenantId: input.tenantId,
    userId: input.userId,
    type: "achievement_unlock",
    title: "🏆 Conquista desbloqueada!",
    message: `Você desbloqueou a conquista "${input.achievementName}"!`,
    actionUrl: "/perfil",
  });
}

/**
 * Cria notificação de milestone de streak.
 */
export async function notifyStreakMilestone(input: {
  tenantId: string;
  userId: string;
  streak: number;
}) {
  const titles: Record<number, string> = {
    7: "🔥 Uma semana consecutiva!",
    14: "🔥 Duas semanas seguidas!",
    21: "🔥 Três semanas de treino!",
    30: "💎 Um mês ininterrupto!",
  };

  const title = titles[input.streak] ?? `🔥 ${input.streak} dias consecutivos!`;

  return createNotification({
    tenantId: input.tenantId,
    userId: input.userId,
    type: "streak_milestone",
    title,
    message: `Você completa ${input.streak} dias seguidos de check-in. Continue assim!`,
    actionUrl: "/perfil",
  });
}

/**
 * Busca notificações não lidas de um usuário.
 */
export async function getUnreadNotificationCount(
  tenantId: string,
  userId: string
): Promise<number> {
  return db.notification.count({
    where: {
      tenantId,
      userId,
      readAt: null,
    },
  });
}

/**
 * Marca notificações como lidas.
 */
export async function markNotificationsAsRead(
  tenantId: string,
  userId: string,
  notificationIds?: string[]
) {
  const where: Record<string, unknown> = {
    tenantId,
    userId,
    readAt: null,
  };

  if (notificationIds && notificationIds.length > 0) {
    where.id = { in: notificationIds };
  }

  await db.notification.updateMany({
    where,
    data: { readAt: new Date() },
  });
}
