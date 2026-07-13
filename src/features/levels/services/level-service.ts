import { db } from "@/lib/db";
import { logger } from "@/features/observability/logger";
import type { RunnerLevel } from "@prisma/client";

// Tipo do cliente de transaction do Prisma
type TxClient = Omit<typeof db, "$transaction" | "$connect" | "$disconnect" | "$on" | "$extends">;

/**
 * Tabela de níveis por KM total acumulado.
 */
const LEVEL_THRESHOLDS: { maxKm: number; level: RunnerLevel; label: string }[] = [
  { maxKm: 49, level: "BEGINNER", label: "Iniciante" },
  { maxKm: 199, level: "RUNNER", label: "Runner" },
  { maxKm: 499, level: "ATHLETE", label: "Atleta" },
  { maxKm: 999, level: "ELITE", label: "Elite" },
  { maxKm: Infinity, level: "LEGEND", label: "Lenda" },
];

/**
 * Mapa de labels dos níveis.
 */
export const LEVEL_LABELS: Record<RunnerLevel, string> = {
  BEGINNER: "Iniciante",
  RUNNER: "Runner",
  ATHLETE: "Atleta",
  ELITE: "Elite",
  LEGEND: "Lenda",
};

/**
 * Mapa de ícones dos níveis.
 */
export const LEVEL_ICONS: Record<RunnerLevel, string> = {
  BEGINNER: "🌱",
  RUNNER: "🏃",
  ATHLETE: "💪",
  ELITE: "🔥",
  LEGEND: "👑",
};

/**
 * Retorna o nível correspondente ao KM total.
 */
export function getLevelFromKm(totalKm: number): RunnerLevel {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalKm <= threshold.maxKm) {
      return threshold.level;
    }
  }
  return "LEGEND";
}

/**
 * Retorna o progresso dentro do nível atual (0–100%).
 */
export function getLevelProgress(totalKm: number): {
  currentLevel: RunnerLevel;
  currentLabel: string;
  nextLevel: RunnerLevel | null;
  nextLabel: string | null;
  progressPercent: number;
  currentKm: number;
  nextThresholdKm: number;
} {
  const currentLevel = getLevelFromKm(totalKm);
  const currentLabel = LEVEL_LABELS[currentLevel];
  const currentIcon = LEVEL_ICONS[currentLevel];

  // Encontra o threshold atual e o próximo
  let currentThreshold: (typeof LEVEL_THRESHOLDS)[number] | null = null;
  let nextThreshold: (typeof LEVEL_THRESHOLDS)[number] | null = null;

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalKm <= LEVEL_THRESHOLDS[i].maxKm) {
      currentThreshold = i > 0 ? LEVEL_THRESHOLDS[i - 1] : { maxKm: 0, level: "BEGINNER", label: "" };
      nextThreshold = LEVEL_THRESHOLDS[i];
      break;
    }
  }

  if (!nextThreshold) {
    // Já é LENDA (infinity)
    return {
      currentLevel: "LEGEND",
      currentLabel,
      nextLevel: null,
      nextLabel: null,
      progressPercent: 100,
      currentKm: totalKm,
      nextThresholdKm: totalKm,
    };
  }

  const startKm = currentThreshold?.maxKm ?? 0;
  const endKm = nextThreshold.maxKm === Infinity ? totalKm : nextThreshold.maxKm;
  const range = endKm - startKm;
  const progress = range > 0 ? Math.min(100, Math.round(((totalKm - startKm) / range) * 100)) : 100;

  return {
    currentLevel,
    currentLabel: `${currentIcon} ${currentLabel}`,
    nextLevel: nextThreshold.level as RunnerLevel,
    nextLabel: LEVEL_LABELS[nextThreshold.level as RunnerLevel],
    progressPercent: progress,
    currentKm: totalKm,
    nextThresholdKm: endKm,
  };
}

/**
 * Atualiza o nível do usuário baseado no KM total.
 * Executado dentro da transaction do check-in.
 * Retorna true se o nível mudou (para gerar notificação).
 */
export async function updateLevel(
  tx: TxClient,
  userId: string,
  totalKm: number
): Promise<boolean> {
  const newLevel = getLevelFromKm(totalKm);

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { level: true },
  });

  if (!user) return false;

  if (user.level !== newLevel) {
    await tx.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });

    logger.info("level.upgraded", {
      userId,
      fromLevel: user.level,
      toLevel: newLevel,
      totalKm,
    });

    return true; // Nível mudou → notificar
  }

  return false;
}
