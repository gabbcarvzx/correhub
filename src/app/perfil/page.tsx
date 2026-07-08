import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { runnerDashboard } from "@/features/demo/data/demo-data";
import { requireUser } from "@/lib/auth/require-user";

export default async function ProfilePage() {
  await requireUser();

  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <Card variant="elevated" className="p-8">
            <Badge variant="secondary">Corredor</Badge>
            <h1 className="mt-4 text-4xl font-black">Mariana Alves</h1>
            <p className="mt-3 text-sm text-muted">Grupo principal: {runnerDashboard.mainGroup.name} - Pace medio: 5:54/km - Distancia favorita: 10 km</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card variant="elevated">
                <p className="text-sm text-muted">Presenças</p>
                <p className="mt-2 text-3xl font-black">28</p>
              </Card>
              <Card variant="elevated">
                <p className="text-sm text-muted">Quilometragem total</p>
                <p className="mt-2 text-3xl font-black">312 km</p>
              </Card>
              <Card variant="elevated">
                <p className="text-sm text-muted">Conquistas</p>
                <p className="mt-2 text-3xl font-black">{runnerDashboard.achievements.length}</p>
              </Card>
            </div>
          </Card>
        </main>
      </PageTransition>
    </AppShell>
  );
}
