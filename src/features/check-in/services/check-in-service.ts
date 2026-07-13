import { auth } from "@/auth";
import { db } from "@/lib/db";
import { findCheckInByEventAndUser } from "@/features/check-in/data/check-in-repository";
import { findEventById } from "@/features/events/data/events-repository";
import { getAuthenticatedTenant } from "@/lib/security/tenant";
import { logger } from "@/features/observability/logger";
import { updateStreak } from "@/features/streaks/services/streak-service";
import { updateLevel, getLevelFromKm } from "@/features/levels/services/level-service";
import { unlockAchievements } from "@/features/achievements/services/achievement-service";
import {
  notifyLevelUp,
  notifyAchievementUnlocked,
  notifyStreakMilestone,
} from "@/features/notifications/services/notification-service";

export function validateCheckInWindow(now: Date, opensAt: Date, closesAt: Date) {
  return now >= opensAt && now <= closesAt;
}

export function ensureCheckInAllowed(input: {
  alreadyCheckedIn: boolean;
  now: Date;
  opensAt: Date;
  closesAt: Date;
}) {
  if (input.alreadyCheckedIn) {
    throw new Error("Check-in already registered.");
  }

  if (!validateCheckInWindow(input.now, input.opensAt, input.closesAt)) {
    throw new Error("Check-in window is closed.");
  }
}

export async function registerCheckInForCurrentUser(input: {
  runEventId: string;
  method?: string;
  kmReported?: number;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const tenant = await getAuthenticatedTenant();

  const event = await findEventById(tenant.id, input.runEventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const existing = await findCheckInByEventAndUser(event.id, session.user.id);

  if (existing) {
    return existing;
  }

  ensureCheckInAllowed({
    alreadyCheckedIn: false,
    now: new Date(),
    opensAt: event.checkInOpensAt,
    closesAt: event.checkInClosesAt
  });

  const now = new Date();
  const kmReported = input.kmReported ?? 0;

  // Transaction: check-in + streak + level + achievements (incrementais)
  const result = await db.$transaction(async (tx) => {
    const existingInTx = await tx.checkIn.findFirst({
      where: {
        runEventId: event.id,
        userId: session.user.id,
        deletedAt: null
      }
    });

    if (existingInTx) {
      return { checkIn: existingInTx, socialUpdates: null };
    }

    const attendance = await tx.attendance.upsert({
      where: {
        runEventId_userId: {
          runEventId: event.id,
          userId: session.user.id
        }
      },
      update: {
        status: "CONFIRMED",
        cancelledAt: null,
        deletedAt: null,
        deletedBy: null
      },
      create: {
        tenantId: tenant.id,
        runEventId: event.id,
        userId: session.user.id,
        status: "CONFIRMED"
      }
    });

    const checkIn = await tx.checkIn.create({
      data: {
        tenantId: tenant.id,
        runEventId: event.id,
        userId: session.user.id,
        attendanceId: attendance.id,
        method: input.method ?? "QR_LINK",
        kmReported
      }
    });

    // --- Social Engine: atualizações incrementais ---

    // 1. Atualiza totalAttendances e totalKm no User (incremental)
    const updatedUser = await tx.user.update({
      where: { id: session.user.id },
      data: {
        totalAttendances: { increment: 1 },
        totalKm: { increment: kmReported },
      },
    });

    // 2. Streak (dentro da mesma transaction)
    await updateStreak(tx, session.user.id, now);

    // Busca streak atualizada
    const user = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { currentStreak: true, level: true },
    });

    // 3. Nível (se KM total mudou)
    const leveledUp = await updateLevel(tx, session.user.id, updatedUser.totalKm);

    return {
      checkIn,
      socialUpdates: {
        leveledUp,
        newLevel: user?.level,
        currentStreak: user?.currentStreak ?? 0,
        newTotalKm: updatedUser.totalKm,
        newTotalAttendances: updatedUser.totalAttendances,
      },
    };
  });

  // --- Social Engine: notificações (fora da transaction) ---

  if (result.socialUpdates) {
    const { socialUpdates } = result;

    // Dispara notificações em background (fire-and-forget)
    notifySocialUpdates(tenant.id, session.user.id, socialUpdates, kmReported).catch((err) => {
      logger.error("check_in.notifications_failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    });

    logger.info("check_in.registered", {
      userId: session.user.id,
      eventId: event.id,
      tenantId: tenant.id,
      kmReported,
      streak: socialUpdates.currentStreak,
      leveledUp: socialUpdates.leveledUp,
    });
  }

  return result.checkIn;
}

/**
 * Dispara notificações de atualizações sociais em background.
 */
async function notifySocialUpdates(
  tenantId: string,
  userId: string,
  updates: {
    leveledUp: boolean;
    newLevel?: string;
    currentStreak: number;
    newTotalKm: number;
    newTotalAttendances: number;
  },
  kmReported: number
) {
  // Notificação de streak milestone (7, 14, 21, 30)
  const streakMilestones = [7, 14, 21, 30];
  if (streakMilestones.includes(updates.currentStreak)) {
    await notifyStreakMilestone({
      tenantId,
      userId,
      streak: updates.currentStreak,
    });
  }

  // Notificação de level up
  if (updates.leveledUp && updates.newLevel) {
    const prevKm = updates.newTotalKm - kmReported;
    const prevLevel = getLevelFromKm(prevKm);
    await notifyLevelUp({
      tenantId,
      userId,
      fromLevel: prevLevel,
      toLevel: updates.newLevel,
    });
  }

  // Notificação de conquistas (verifica totais atualizados)
  const unlockedAchievements = await unlockAchievements(
    db,
    {
      tenantId,
      userId,
      totalKm: updates.newTotalKm,
      totalCheckins: updates.newTotalAttendances,
      currentStreak: updates.currentStreak,
    }
  );

  for (const achievementName of unlockedAchievements) {
    await notifyAchievementUnlocked({
      tenantId,
      userId,
      achievementName,
    });
  }
}
