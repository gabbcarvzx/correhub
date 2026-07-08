import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EventCard } from "@/components/shared/event-card";
import { PageTransition } from "@/components/ui/page-transition";
import { AttendanceToggleButton } from "@/features/attendance/components/attendance-toggle-button";
import { getPublicGroupDetails } from "@/features/groups/services/groups-service";
import { RankingCard } from "@/components/shared/ranking-card";

export default async function GroupDetailsPage({
  params
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const details = await getPublicGroupDetails(slug);

  if (!details) {
    notFound();
  }

  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <Card variant="elevated" className="rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-8 text-white shadow-lg">
            <Badge variant="secondary" className="bg-white/10 text-white">{details.group.status}</Badge>
            <h1 className="mt-4 text-4xl font-black">{details.group.name}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">{details.group.description}</p>
            <p className="mt-6 text-sm text-white/60">Local: {details.group.meetingPoint} • Líder: {details.group.leader}</p>
          </Card>

          <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="grid gap-4">
              {details.events.map((event) => (
                <EventCard key={event.id} action={<AttendanceToggleButton runEventId={event.id} status={event.attendanceStatus} />} event={event} />
              ))}
            </div>
            <Card variant="elevated">
              <h2 className="text-xl font-bold">Ranking interno</h2>
              <div className="mt-5 grid gap-3">
                {details.ranking.map((entry) => (
                  <RankingCard key={`${entry.position}-${entry.name}`} entry={entry} />
                ))}
              </div>
            </Card>
          </section>
        </main>
      </PageTransition>
    </AppShell>
  );
}
