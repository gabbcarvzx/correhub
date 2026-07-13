import { Trophy, TrendingUp, CalendarDays } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { RankingCard } from "@/components/shared/ranking-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/ui/page-transition";
import { MotionDiv, staggerContainer, staggerItem } from "@/components/ui/motion-wrapper";
import { getWeeklyRanking, getMonthlyRanking } from "@/features/rankings/services/rankings-service";
import { getCurrentTenant } from "@/lib/security/tenant";

export const dynamic = "force-dynamic";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period = rawPeriod === "monthly" ? "monthly" : "weekly";
  const tenant = await getCurrentTenant();

  const ranking =
    period === "monthly"
      ? await getMonthlyRanking(tenant.id, 50)
      : await getWeeklyRanking(tenant.id, 50);

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          {/* Header with period toggle */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow={period === "weekly" ? "Ranking semanal" : "Ranking mensal"}
              title="Quem está puxando o pace da cidade"
              description="Ranking calculado em tempo real com base nos check-ins e quilometragem registrada."
            />
            <div className="flex gap-2 shrink-0">
              <Button
                asChild
                variant={period === "weekly" ? "primary" : "outline"}
                size="sm"
              >
                <Link href="/ranking?period=weekly">
                  <TrendingUp className="h-4 w-4" />
                  Semanal
                </Link>
              </Button>
              <Button
                asChild
                variant={period === "monthly" ? "primary" : "outline"}
                size="sm"
              >
                <Link href="/ranking?period=monthly">
                  <CalendarDays className="h-4 w-4" />
                  Mensal
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats summary */}
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Card variant="elevated" className="p-4">
              <p className="text-xs text-muted">Total de corredores</p>
              <p className="mt-1 text-2xl font-black">{ranking.entries.length}</p>
            </Card>
            <Card variant="elevated" className="p-4">
              <p className="text-xs text-muted">Total de KM registrados</p>
              <p className="mt-1 text-2xl font-black">
                {ranking.entries.reduce((sum, e) => sum + e.totalKm, 0).toFixed(0)} km
              </p>
            </Card>
            <Card variant="elevated" className="p-4">
              <p className="text-xs text-muted">Período</p>
              <p className="mt-1 text-2xl font-black capitalize">
                {period === "weekly" ? "7 dias" : "30 dias"}
              </p>
            </Card>
          </div>

          {/* Ranking list */}
          {ranking.entries.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon={Trophy}
                title="Nenhum dado no período"
                description="Faça check-in nos treinos para aparecer no ranking da cidade."
              />
            </div>
          ) : (
            <MotionDiv
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mt-8 grid gap-3"
            >
              {ranking.entries.map((entry) => (
                <MotionDiv key={`${entry.userId}-${period}`} variants={staggerItem}>
                  <RankingCard
                    entry={{
                      position: entry.position,
                      name: entry.name,
                      group: "Cidade",
                      attendances: entry.totalRuns,
                      km: entry.totalKm,
                    }}
                  />
                </MotionDiv>
              ))}
            </MotionDiv>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
