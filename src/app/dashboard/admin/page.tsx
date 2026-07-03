import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/shared/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { adminDashboard } from "@/features/demo/data/demo-data";
import { requireUser } from "@/lib/auth/require-user";

export default async function AdminDashboardPage() {
  await requireUser();

  return (
    <AppShell>
      <main className="app-shell py-8">
        <h1 className="text-4xl font-black">Painel administrativo</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">Moderacao de grupos e parceiros, metricas gerais e operacao do tenant.</p>
        <section className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
          {adminDashboard.kpis.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </section>
        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-xl font-bold">Grupos pendentes</h2>
            <div className="mt-4 grid gap-3">
              {adminDashboard.pendingGroups.map((group) => (
                <div key={group.id} className="rounded-2xl bg-white p-4 ring-1 ring-[var(--border)]">
                  <p className="font-semibold">{group.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{group.description}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-xl font-bold">Parceiros pendentes</h2>
            <div className="mt-4 grid gap-3">
              {adminDashboard.pendingPartners.map((partner) => (
                <div key={partner.slug} className="rounded-2xl bg-white p-4 ring-1 ring-[var(--border)]">
                  <p className="font-semibold">{partner.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{partner.category}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </AppShell>
  );
}
