import { db } from "@/lib/db";

// Tipo do cliente de transaction do Prisma
type TxClient = Omit<typeof db, "$transaction" | "$connect" | "$disconnect" | "$on" | "$extends">;

/**
 * Atualiza a streak do usuário após um check-in.
 *
 * Lógica:
 * - Se o último check-in foi ontem → incrementa streak
 * - Se o último check-in foi hoje → mantém streak (não duplica)
 * - Se passou mais de 1 dia → reinicia streak em 1
 * - Se é o primeiro check-in → streak = 1
 *
 * Executado dentro da transaction do check-in.
 */
export async function updateStreak(
  tx: TxClient,
  userId: string,
  checkedInAt: Date
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastCheckInDate: true },
  });

  if (!user) return;

  const today = new Date(Date.UTC(
    checkedInAt.getUTCFullYear(),
    checkedInAt.getUTCMonth(),
    checkedInAt.getUTCDate()
  ));

  const lastDate = user.lastCheckInDate
    ? new Date(Date.UTC(
        user.lastCheckInDate.getUTCFullYear(),
        user.lastCheckInDate.getUTCMonth(),
        user.lastCheckInDate.getUTCDate()
      ))
    : null;

  // Mesmo dia → não altera streak
  if (lastDate && today.getTime() === lastDate.getTime()) {
    return;
  }

  // Verifica se é consecutivo: diff de exatamente 1 dia
  const diffDays = lastDate
    ? Math.round((today.getTime() - lastDate.getTime()) / 86400000)
    : null;

  let newStreak: number;

  if (lastDate === null) {
    // Primeiro check-in
    newStreak = 1;
  } else if (diffDays === 1) {
    // Consecutivo
    newStreak = user.currentStreak + 1;
  } else {
    // Quebrou a streak
    newStreak = 1;
  }

  const newLongestStreak = Math.max(user.longestStreak, newStreak);

  await tx.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastCheckInDate: today,
    },
  });
}

/**
 * Retorna dados da streak para exibição.
 */
export async function getStreakInfo(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastCheckInDate: true,
    },
  });

  if (!user) {
    return { currentStreak: 0, longestStreak: 0, isAtRisk: false };
  }

  // Verifica se a streak está em risco (não fez check-in hoje e passou 23h+)
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const isAtRisk = user.lastCheckInDate
    ? user.lastCheckInDate.getTime() < todayStart.getTime()
    : false;

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    isAtRisk,
  };
}
