import { notFound } from "next/navigation";
import Link from "next/link";
import { Flame, Medal, TrendingUp, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { AvatarUpload } from "@/components/features/avatar-upload";
import { getCachedSignedUrl } from "@/features/uploads/signed-url-cache";
import { getStreakInfo } from "@/features/streaks/services/streak-service";
import { getLevelProgress, LEVEL_LABELS, LEVEL_ICONS } from "@/features/levels/services/level-service";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentTenant } from "@/lib/security/tenant";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProfilePage() {
  const user = await requireUser();
  const tenant = await getCurrentTenant();

  const [fullUser, achievements, mainGroup] = await Promise.all([
    db.user.findFirst({
      where: { id: user.id, tenantId: tenant.id, deletedAt: null },
    }),
    db.userAchievement.findMany({
      where: { tenantId: tenant.id, userId: user.id },
      include: {
        achievement: { select: { name: true, icon: true, description: true } },
      },
      orderBy: { earnedAt: "desc" },
    }),
    db.group.findFirst({
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        members: { some: { userId: user.id, deletedAt: null } },
      },
    }),
  ]);

  if (!fullUser) {
    notFound();
  }

  const avatarSignedUrl = await getCachedSignedUrl(fullUser.image);
  const streak = await getStreakInfo(user.id);
  const levelProgress = getLevelProgress(fullUser.totalKm);

  const roleLabels: Record<string, string> = {
    RUNNER: "Corredor",
    GROUP_LEADER: "Líder de grupo",
    PARTNER: "Parceiro",
    ADMIN: "Administrador",
  };

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          <Card variant="elevated" className="p-8">
            {/* Header com avatar + info */}
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <AvatarUpload
                currentStorageKey={fullUser.image}
                currentSignedUrl={avatarSignedUrl}
                userName={fullUser.name}
                userId={fullUser.id}
              />

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <Badge variant="secondary">
                    {roleLabels[fullUser.role] ?? fullUser.role}
                  </Badge>
                  <Badge variant="default" className="text-sm bg-brand-100 text-brand-700">
                    {levelProgress.currentLabel}
                  </Badge>
                </div>
                <h1 className="mt-4 text-4xl font-black">{fullUser.name}</h1>
                <p className="mt-3 text-sm text-muted">
                  {fullUser.email}
                  {fullUser.city ? ` · ${fullUser.city}` : ""}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {mainGroup
                    ? `Grupo principal: ${mainGroup.name}`
                    : "Sem grupo ativo"}
                  {fullUser.paceAvg ? ` · Pace médio: ${fullUser.paceAvg}` : ""}
                  {fullUser.preferredDistance
                    ? ` · Distância favorita: ${fullUser.preferredDistance
                        .replace("KM_", "")
                        .replace("_", ",")} km`
                    : ""}
                </p>
                {fullUser.bio && (
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted italic">
                    &ldquo;{fullUser.bio}&rdquo;
                  </p>
                )}
                <Link
                  href={`/atleta/${fullUser.name}`}
                  className="mt-4 inline-block text-sm text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Ver perfil público →
                </Link>
              </div>
            </div>

            {/* Level progress */}
            {levelProgress.nextLevel && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">
                    Progresso para {levelProgress.nextLabel}
                  </span>
                  <span className="text-sm font-semibold">{levelProgress.progressPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-solid">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all"
                    style={{ width: `${levelProgress.progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted">
                  {levelProgress.currentKm} / {levelProgress.nextThresholdKm} km
                </p>
              </div>
            )}

            {/* Métricas */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card variant="elevated" className="p-5">
                <div className="flex items-center gap-2">
                  <Medal className="h-4 w-4 text-muted" />
                  <p className="text-sm text-muted">Presenças</p>
                </div>
                <p className="mt-2 text-3xl font-black">{fullUser.totalAttendances}</p>
              </Card>
              <Card variant="elevated" className="p-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted" />
                  <p className="text-sm text-muted">Quilometragem total</p>
                </div>
                <p className="mt-2 text-3xl font-black">{fullUser.totalKm} km</p>
              </Card>
              <Card variant="elevated" className={cn(
                "p-5",
                streak.currentStreak >= 7 && "border-orange-400"
              )}>
                <div className="flex items-center gap-2">
                  <Flame className={cn(
                    "h-4 w-4",
                    streak.currentStreak >= 7 ? "text-orange-500" : "text-muted"
                  )} />
                  <p className="text-sm text-muted">Streak</p>
                </div>
                <p className={cn(
                  "mt-2 text-3xl font-black",
                  streak.currentStreak >= 7 && "text-orange-500"
                )}>
                  {streak.currentStreak} dias
                </p>
                <p className="text-xs text-muted">Recorde: {streak.longestStreak} dias</p>
              </Card>
              <Card variant="elevated" className="p-5">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted" />
                  <p className="text-sm text-muted">Conquistas</p>
                </div>
                <p className="mt-2 text-3xl font-black">{achievements.length}</p>
              </Card>
            </div>

            {/* Conquistas detalhadas */}
            {achievements.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-bold mb-4">Conquistas</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {achievements.map((ua) => (
                    <Card key={ua.id} variant="elevated" className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{ua.achievement.icon}</span>
                        <div>
                          <p className="font-semibold text-fg">{ua.achievement.name}</p>
                          <p className="mt-1 text-sm text-muted">{ua.achievement.description}</p>
                          <p className="mt-2 text-[11px] text-muted">
                            {new Date(ua.earnedAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </PageTransition>
    </AppShell>
  );
}
