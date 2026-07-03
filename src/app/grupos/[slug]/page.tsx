import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { EventCard } from "@/components/shared/event-card";
import { groups, events, ranking } from "@/features/demo/data/demo-data";

export default async function GroupDetailsPage({
  params
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const group = groups.find((entry) => entry.slug === slug);

  if (!group) {
    notFound();
  }

  const groupEvents = events.filter((event) => event.groupSlug === slug);

  return (
    <AppShell>
      <main className="app-shell py-8">
        <Card className="rounded-[var(--radius-lg)] bg-[linear-gradient(160deg,#0f172a,#163623)] p-8 text-white">
          <Badge className="bg-white/10 text-white">{group.status}</Badge>
          <h1 className="mt-4 text-4xl font-black">{group.name}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">{group.description}</p>
          <p className="mt-6 text-sm text-slate-300">Local: {group.meetingPoint} • Lider: {group.leader}</p>
        </Card>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="grid gap-4">
            {groupEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <Card>
            <h2 className="text-xl font-bold">Ranking interno</h2>
            <div className="mt-5 grid gap-3">
              {ranking.map((entry) => (
                <div key={entry.position} className="rounded-2xl bg-white p-4 ring-1 ring-[var(--border)]">
                  <p className="font-semibold">
                    #{entry.position} {entry.name}
                  </p>
                  <p className="text-sm text-[var(--muted)]">{entry.km} km • {entry.attendances} presencas</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </AppShell>
  );
}
