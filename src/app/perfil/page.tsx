import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { runnerDashboard } from "@/features/demo/data/demo-data";
import { requireUser } from "@/lib/auth/require-user";

export default async function ProfilePage() {
  await requireUser();

  return (
    <AppShell>
      <main className="app-shell py-8">
        <Card className="rounded-[var(--radius-lg)] p-8">
          <Badge>Corredor</Badge>
          <h1 className="mt-4 text-4xl font-black">Mariana Alves</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">Grupo principal: {runnerDashboard.mainGroup.name} - Pace medio: 5:54/km - Distancia favorita: 10 km</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-sm text-[var(--muted)]">Presencas</p>
              <p className="mt-2 text-3xl font-black">28</p>
            </Card>
            <Card>
              <p className="text-sm text-[var(--muted)]">Quilometragem total</p>
              <p className="mt-2 text-3xl font-black">312 km</p>
            </Card>
            <Card>
              <p className="text-sm text-[var(--muted)]">Conquistas</p>
              <p className="mt-2 text-3xl font-black">{runnerDashboard.achievements.length}</p>
            </Card>
          </div>
        </Card>
      </main>
    </AppShell>
  );
}
