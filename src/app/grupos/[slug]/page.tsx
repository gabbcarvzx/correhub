import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { EventCard } from "@/components/shared/event-card";
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
      <main className="app-shell py-8">
        <Card className="rounded-[var(--radius-lg)] bg-[linear-gradient(160deg,#0f172a,#163623)] p-8 text-white">
          <Badge className="bg-white/10 text-white">{details.group.status}</Badge>
          <h1 className="mt-4 text-4xl font-black">{details.group.name}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">{details.group.description}</p>
          <p className="mt-6 text-sm text-slate-300">Local: {details.group.meetingPoint} • Lider: {details.group.leader}</p>
        </Card>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="grid gap-4">
            {details.events.map((event) => (
              <EventCard key={event.id} action={<AttendanceToggleButton runEventId={event.id} status={event.attendanceStatus} />} event={event} />
            ))}
          </div>
          <Card>
            <h2 className="text-xl font-bold">Ranking interno</h2>
            <div className="mt-5 grid gap-3">
              {details.ranking.map((entry) => (
                <RankingCard key={`${entry.position}-${entry.name}`} entry={entry} />
              ))}
            </div>
          </Card>
        </section>
      </main>
    </AppShell>
  );
}
