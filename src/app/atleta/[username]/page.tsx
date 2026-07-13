import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, Medal, Flame, Trophy, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { getAthletePublicProfile } from "@/features/athlete/services/athlete-service";
import { getCurrentTenant } from "@/lib/security/tenant";
import { LEVEL_LABELS, LEVEL_ICONS } from "@/features/levels/services/level-service";

// ---------------------------------------------------------------------------
// Metadata dinâmica
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const tenant = await getCurrentTenant();
  const profile = await getAthletePublicProfile(tenant.id, username);

  if (!profile) {
    return { title: "Atleta não encontrado — CorreHub" };
  }

  return {
    title: `${profile.name} — Corredor no CorreHub`,
    description: `${profile.levelIcon} ${profile.name} — ${profile.totalKm} km acumulados, streak de ${profile.currentStreak} dias. Conheça o perfil público no CorreHub ${tenant.name}.`,
    openGraph: {
      title: `${profile.name} — Corredor no CorreHub`,
      description: `${profile.levelLabel} · ${profile.totalKm} km · ${profile.currentStreak} dias de streak`,
      type: "profile",
      ...(profile.image ? { images: [{ url: profile.image }] } : {}),
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AthletePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const tenant = await getCurrentTenant();
  const profile = await getAthletePublicProfile(tenant.id, username);

  if (!profile) {
    notFound();
  }

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          {/* Hero */}
          <Card variant="elevated" className="rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-8 text-white shadow-lg">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/30">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/20 text-3xl font-bold text-white">
                      {profile.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  {profile.levelIcon} {profile.levelLabel}
                </Badge>
                <h1 className="mt-4 text-4xl font-black">{profile.name}</h1>
                {profile.bio && (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                    {profile.bio}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-white/60 md:justify-start">
                  {profile.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {profile.city}
                    </span>
                  )}
                  {profile.paceAvg && (
                    <span className="flex items-center gap-1">
                      Pace médio: {profile.paceAvg}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Métricas principais */}
          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card variant="elevated" className="p-5">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-brand-500" />
                <p className="text-sm text-muted">KM total</p>
              </div>
              <p className="mt-2 text-3xl font-black">{profile.totalKm} km</p>
            </Card>
            <Card variant="elevated" className="p-5">
              <div className="flex items-center gap-3">
                <Flame className={`h-5 w-5 ${profile.currentStreak >= 7 ? "text-orange-500" : "text-brand-500"}`} />
                <p className="text-sm text-muted">Streak atual</p>
              </div>
              <p className="mt-2 text-3xl font-black">{profile.currentStreak} dias</p>
            </Card>
            <Card variant="elevated" className="p-5">
              <div className="flex items-center gap-3">
                <Medal className="h-5 w-5 text-brand-500" />
                <p className="text-sm text-muted">Maior streak</p>
              </div>
              <p className="mt-2 text-3xl font-black">{profile.longestStreak} dias</p>
            </Card>
            <Card variant="elevated" className="p-5">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-brand-500" />
                <p className="text-sm text-muted">Ranking mensal</p>
              </div>
              <p className="mt-2 text-3xl font-black">
                {profile.rankingPosition ? `#${profile.rankingPosition}` : "—"}
              </p>
            </Card>
          </section>

          {/* Gráfico simples (últimos 30 dias) */}
          <section className="mt-8">
            <Card variant="elevated" className="p-6">
              <h2 className="text-lg font-bold">KM nos últimos 30 dias</h2>
              {profile.monthlyKm.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Nenhum check-in registrado neste período.</p>
              ) : (
                <div className="mt-6 flex items-end gap-1.5">
                  {profile.monthlyKm.map((day) => {
                    const maxKm = Math.max(...profile.monthlyKm.map((d) => d.km));
                    const heightPercent = maxKm > 0 ? (day.km / maxKm) * 100 : 0;
                    return (
                      <div
                        key={day.date}
                        className="group relative flex flex-1 flex-col items-center"
                      >
                        <span className="mb-1 hidden text-xs text-muted group-hover:block">
                          {day.km} km
                        </span>
                        <div
                          className="w-full rounded-t bg-gradient-to-t from-brand-500 to-brand-300 transition-all"
                          style={{ height: `${Math.max(heightPercent, 4)}px` }}
                        />
                        <span className="mt-1 text-[10px] text-muted">
                          {new Date(day.date).toLocaleDateString("pt-BR", { day: "2-digit" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>

          {/* Conquistas */}
          {profile.achievements.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold mb-4">Conquistas</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profile.achievements.map((ach) => (
                  <Card key={ach.id} variant="elevated" className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{ach.icon}</span>
                      <div>
                        <p className="font-semibold text-fg">{ach.name}</p>
                        <p className="mt-1 text-sm text-muted">{ach.description}</p>
                        <p className="mt-2 text-[11px] text-muted">
                          {new Date(ach.earnedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
