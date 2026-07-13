import { Flame, Medal, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/shared/event-card";
import { KpiCard } from "@/components/shared/kpi-card";
import { PartnerCard } from "@/components/shared/partner-card";
import { PageTransition } from "@/components/ui/page-transition";
import { AttendanceToggleButton } from "@/features/attendance/components/attendance-toggle-button";
import { getRunnerDashboardData } from "@/features/dashboard/services/dashboard-service";
import { getUserDashboardMetrics } from "@/features/rankings/services/rankings-service";
import { getStreakInfo } from "@/features/streaks/services/streak-service";
import { getLevelProgress, LEVEL_LABELS, LEVEL_ICONS } from "@/features/levels/services/level-service";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentTenant } from "@/lib/security/tenant";
import { cn } from "@/lib/utils";
import type { RunnerLevel } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const tenant = await getCurrentTenant();
  const runnerDashboard = await getRunnerDashboardData(user.id);
  const metrics = await getUserDashboardMetrics(tenant.id, user.id);
  const streak = await getStreakInfo(user.id);
  const levelProgress = getLevelProgress(metrics.totalKmAllTime);

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          {/* Hero com level badge */}
          <section className="grid gap-4 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Dashboard do corredor</p>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-sm px-3 py-1">
                {levelProgress.currentLabel}
              </Badge>
            </div>
            <h1 className="text-4xl font-black">Bom treino, {user.name?.split(" ")[0] ?? "corredor"}.</h1>
            <p className="max-w-2xl text-sm text-slate-200">
              {metrics.activeDays30d > 0
                ? `${metrics.activeDays30d} dias ativos nos últimos 30 dias — ${metrics.frequency}% de frequência.`
                : "Complete seu primeiro check-in para começar a acompanhar sua evolução."}
            </p>
          </section>

          {/* Streak Card + KPIs */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Streak card */}
            <Card variant="elevated" className={cn(
              "p-5 border-2 transition-all",
              streak.currentStreak >= 7
                ? "border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20"
                : "border-border"
            )}>
              <div className="flex items-center gap-2">
                <Flame className={cn(
                  "h-5 w-5",
                  streak.currentStreak >= 7 ? "text-orange-500" : "text-muted"
                )} />
                <p className="text-sm text-muted">Streak 🔥</p>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <p className={cn(
                  "text-3xl font-black",
                  streak.currentStreak >= 7 && "text-orange-500"
                )}>
                  {streak.currentStreak}
                </p>
                <span className="text-sm text-muted">dias</span>
              </div>
              {streak.isAtRisk && streak.currentStreak > 0 && (
                <p className="mt-1 text-xs text-red-500 font-medium">
                  Faça check-in hoje para não perder sua streak!
                </p>
              )}
              {streak.currentStreak > 0 && (
                <p className="mt-1 text-xs text-muted">
                  Melhor: {streak.longestStreak} dias
                </p>
              )}
            </Card>

            <KpiCard label="KM no mês" value={`${metrics.totalKm30d} km`} />
            <KpiCard label="Total acumulado" value={`${metrics.totalKmAllTime} km`} />
            <KpiCard label="Frequência (30d)" value={`${metrics.frequency}%`} />
          </section>

          {/* Level progress bar */}
          {levelProgress.nextLevel && (
            <section className="mt-4">
              <Card variant="elevated" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted">Progresso para {levelProgress.nextLabel}</span>
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
              </Card>
            </section>
          )}

          {/* Últimos check-ins */}
          <section className="mt-8">
            <h2 className="mb-4 text-xl font-bold">Últimas atividades</h2>
            {metrics.last10Checkins.length === 0 ? (
              <Card variant="elevated" className="p-6 text-center text-sm text-muted">
                Nenhum check-in registrado ainda. Participe de um treino para começar!
              </Card>
            ) : (
              <div className="grid gap-3">
                {metrics.last10Checkins.map((checkin) => (
                  <Card key={checkin.id} variant="elevated" className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-fg">
                        {checkin.event?.title ?? "Treino"}
                      </p>
                      <p className="text-sm text-muted">
                        {new Date(checkin.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">
                      {checkin.km ?? "—"} km
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Próximo evento + conquistas */}
          <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <EventCard
              action={
                <AttendanceToggleButton
                  runEventId={runnerDashboard.nextEvent.id}
                  status={runnerDashboard.nextEvent.attendanceStatus}
                />
              }
              event={runnerDashboard.nextEvent}
            />
            <Card variant="elevated" className="p-5">
              <h2 className="text-xl font-bold">Conquistas</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {runnerDashboard.achievements.map((ach) => (
                  <Badge key={ach} variant="success" size="sm">
                    {ach}
                  </Badge>
                ))}
              </div>
              {runnerDashboard.achievements.length === 0 && (
                <p className="mt-4 text-sm text-muted">
                  Complete check-ins para desbloquear conquistas.
                </p>
              )}
              {runnerDashboard.achievements.length > 0 && (
                <Link
                  href="/perfil"
                  className="mt-3 inline-block text-sm text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Ver todas as conquistas →
                </Link>
              )}
            </Card>
          </section>

          {/* Próximos eventos + parceiros */}
          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card variant="elevated" className="p-5">
              <h2 className="text-xl font-bold">Próximos eventos</h2>
              <div className="mt-4 grid gap-3">
                {runnerDashboard.upcomingEvents.map((event) => (
                  <Card key={event.id} variant="elevated" className="p-4">
                    <p className="text-sm font-medium text-fg">{event.title}</p>
                    <p className="text-sm text-muted">{event.groupName} — {new Date(event.date).toLocaleDateString("pt-BR")}</p>
                  </Card>
                ))}
              </div>
            </Card>
            <Card variant="elevated" className="p-5">
              <h2 className="text-xl font-bold">Últimos check-ins</h2>
              <div className="mt-4 grid gap-3">
                {runnerDashboard.lastCheckIns.map((item) => (
                  <Card key={item} variant="elevated" className="p-4">
                    <p className="text-sm text-fg">{item}</p>
                  </Card>
                ))}
              </div>
            </Card>
          </section>

          {/* Parceiros próximos */}
          {runnerDashboard.nearbyPartners.length > 0 && (
            <section className="mt-8 grid gap-4 md:grid-cols-2">
              {runnerDashboard.nearbyPartners.map((partner) => (
                <PartnerCard key={partner.slug} partner={partner} />
              ))}
            </section>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
