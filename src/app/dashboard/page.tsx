import { AppShell } from "@/components/layout/app-shell";
import { EventCard } from "@/components/shared/event-card";
import { KpiCard } from "@/components/shared/kpi-card";
import { PartnerCard } from "@/components/shared/partner-card";
import { runnerDashboard } from "@/features/demo/data/demo-data";
import { requireUser } from "@/lib/auth/require-user";

export default async function DashboardPage() {
  await requireUser();

  return (
    <AppShell>
      <main className="app-shell py-8">
        <section className="grid gap-4 rounded-[var(--radius-lg)] bg-[linear-gradient(160deg,#0f172a,#163623)] p-8 text-white">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Dashboard do corredor</p>
          <h1 className="text-4xl font-black">Bom treino, Mariana.</h1>
          <p className="max-w-2xl text-sm text-slate-200">Seu proximo compromisso ja esta confirmado. O app foi desenhado para parecer nativo no celular e acelerar sua rotina de treino.</p>
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <KpiCard label="Km no mes" value={`${runnerDashboard.monthKm} km`} />
          <KpiCard label="Ranking atual" value={`#${runnerDashboard.rankingPosition}`} />
          <KpiCard label="Grupo principal" value={runnerDashboard.mainGroup.name} />
          <KpiCard label="Conquistas" value={runnerDashboard.achievements.length} />
        </section>
        <section className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <EventCard event={runnerDashboard.nextEvent} />
          <CardList title="Ultimos check-ins" items={runnerDashboard.lastCheckIns} />
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
    <div className="glass-panel rounded-[var(--radius-md)] p-5">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <div key={item} className="rounded-2xl bg-white p-4 ring-1 ring-[var(--border)]">
            <p className="text-sm text-[var(--foreground)]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
