import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EventCard } from "@/components/shared/event-card";
import { KpiCard } from "@/components/shared/kpi-card";
import { PageTransition } from "@/components/ui/page-transition";
import { getLeaderDashboardData } from "@/features/dashboard/services/dashboard-service";
import { requireRole } from "@/lib/auth/require-role";

export default async function GroupDashboardPage() {
  const user = await requireRole(["GROUP_LEADER", "ADMIN"]);
  const leaderDashboard = await getLeaderDashboardData(user.id);

  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge variant="secondary">Status {leaderDashboard.approvalStatus}</Badge>
              <h1 className="mt-4 text-4xl font-black">{leaderDashboard.group.name}</h1>
              <p className="mt-3 text-sm text-muted">Painel do líder com agenda, check-in, comunicados e status de aprovação.</p>
            </div>
          </div>
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {leaderDashboard.metrics.map((metric) => (
              <KpiCard key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </section>
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            {leaderDashboard.events?.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </section>
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <Card variant="elevated">
              <h2 className="text-xl font-bold">QRCode de check-in</h2>
              <p className="mt-3 text-sm text-muted">Gerar token seguro por evento, com janela válida e registro autenticado.</p>
              <div className="mt-6 flex h-44 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent_60%),white] border border-border">
                <div className="grid h-28 w-28 place-items-center rounded-2xl bg-fg text-xs font-bold text-white">QR</div>
              </div>
            </Card>
            <Card variant="elevated">
              <h2 className="text-xl font-bold">Solicitação do grupo</h2>
              <p className="mt-3 text-sm text-muted">Observações do admin aparecem aqui em caso de rejeição. Slug permanece imutável após publicação.</p>
              <div className="mt-6 rounded-xl bg-surface-solid p-4 border border-border">
                <p className="text-sm text-muted">Slug atual</p>
                <p className="mt-2 text-lg font-bold">{leaderDashboard.group.slug}</p>
              </div>
            </Card>
          </section>
        </main>
      </PageTransition>
    </AppShell>
  );
}
