import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { EventCard } from "@/components/shared/event-card";
import { KpiCard } from "@/components/shared/kpi-card";
import { PartnerCard } from "@/components/shared/partner-card";
import { PageTransition } from "@/components/ui/page-transition";
import { AttendanceToggleButton } from "@/features/attendance/components/attendance-toggle-button";
import { getRunnerDashboardData } from "@/features/dashboard/services/dashboard-service";
import { requireUser } from "@/lib/auth/require-user";

export default async function DashboardPage() {
  const user = await requireUser();
  const runnerDashboard = await getRunnerDashboardData(user.id);

  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <section className="grid gap-4 rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-8 text-white shadow-lg">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Dashboard do corredor</p>
            <h1 className="text-4xl font-black">Bom treino, Mariana.</h1>
            <p className="max-w-2xl text-sm text-slate-200">Seu próximo compromisso já está confirmado. O app foi desenhado para parecer nativo no celular e acelerar sua rotina de treino.</p>
          </section>
          <section className="mt-8 grid gap-4 md:grid-cols-4">
            <KpiCard label="Km no mes" value={`${runnerDashboard.monthKm} km`} />
            <KpiCard label="Ranking atual" value={`#${runnerDashboard.rankingPosition}`} />
            <KpiCard label="Grupo principal" value={runnerDashboard.mainGroup.name} />
            <KpiCard label="Conquistas" value={runnerDashboard.achievements.length} />
          </section>
          <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <EventCard action={<AttendanceToggleButton runEventId={runnerDashboard.nextEvent.id} status={runnerDashboard.nextEvent.attendanceStatus} />} event={runnerDashboard.nextEvent} />
            <CardList title="Últimos check-ins" items={runnerDashboard.lastCheckIns} />
          </section>
          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <CardList title="Conquistas desbloqueadas" items={runnerDashboard.achievements} />
            <CardList title="Eventos futuros" items={runnerDashboard.upcomingEvents.map((event) => `${event.title} - ${event.groupName}`)} />
          </section>
          <section className="mt-8 grid gap-4 md:grid-cols-2">
            {runnerDashboard.nearbyPartners.map((partner) => (
              <PartnerCard key={partner.slug} partner={partner} />
            ))}
          </section>
        </main>
      </PageTransition>
    </AppShell>
  );
}

function CardList({
  title,
  items
}: Readonly<{
  title: string;
  items: string[];
}>) {
  return (
    <Card variant="elevated" className="p-5">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <Card variant="elevated" key={item} className="p-4">
            <p className="text-sm text-fg">{item}</p>
          </Card>
        ))}
      </div>
    </Card>
  );
}
