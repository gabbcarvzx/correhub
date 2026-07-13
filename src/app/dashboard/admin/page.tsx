import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { PageTransition } from "@/components/ui/page-transition";
import { ModerationActionCard } from "@/features/admin/components/moderation-action-card";
import { getAdminDashboardData } from "@/features/dashboard/services/dashboard-service";
import { requireRole } from "@/lib/auth/require-role";

export default async function AdminDashboardPage() {
  await requireRole(["ADMIN"]);
  const adminDashboard = await getAdminDashboardData();

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          <h1 className="text-4xl font-black tracking-tight">Painel Administrativo</h1>
          <p className="mt-3 text-sm text-muted">Moderação de grupos e parceiros, métricas gerais e operação do tenant.</p>
          <section className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {adminDashboard.kpis.map((kpi) => (
              <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
            ))}
          </section>
          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <Card variant="elevated" className="p-5">
              <h2 className="text-xl font-bold">Grupos pendentes</h2>
              <div className="mt-4 grid gap-3">
                {adminDashboard.pendingGroups.map((group) => (
                  <ModerationActionCard entityId={group.id} entityType="groups" key={group.id} subtitle={group.description} title={group.name} />
                ))}
              </div>
            </Card>
            <Card variant="elevated" className="p-5">
              <h2 className="text-xl font-bold">Parceiros pendentes</h2>
              <div className="mt-4 grid gap-3">
                {adminDashboard.pendingPartners.map((partner) => (
                  <ModerationActionCard entityId={partner.id} entityType="partners" key={partner.id} subtitle={partner.category} title={partner.name} />
                ))}
              </div>
            </Card>
          </section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
