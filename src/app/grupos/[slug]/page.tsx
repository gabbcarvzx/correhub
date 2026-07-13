import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EventCard } from "@/components/shared/event-card";
import { PageTransition } from "@/components/ui/page-transition";
import { AttendanceToggleButton } from "@/features/attendance/components/attendance-toggle-button";
import { GroupLogoUpload } from "@/components/features/group-logo-upload";
import { getPublicGroupDetails } from "@/features/groups/services/groups-service";
import { RankingCard } from "@/components/shared/ranking-card";
import { db } from "@/lib/db";

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

  // Verifica permissão: líder do grupo ou admin
  const session = await auth();
  const isLeader = session?.user?.id === details.group.leaderUserId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isLeader || isAdmin;

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          {/* Hero com logo */}
          <Card variant="elevated" className="rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-8 text-white shadow-lg">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* Logo com upload (se tiver permissão) */}
              {canEdit ? (
                <GroupLogoUpload
                  groupSlug={slug}
                  groupName={details.group.name}
                  currentSignedUrl={details.group.logoUrl}
                />
              ) : details.group.logoUrl ? (
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-white/30">
                    <img
                      src={details.group.logoUrl}
                      alt={details.group.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}

              <div className="flex-1 text-center md:text-left">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  {details.group.status}
                </Badge>
                <h1 className="mt-4 text-4xl font-black">{details.group.name}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">
                  {details.group.description}
                </p>
                <p className="mt-6 text-sm text-white/60">
                  📍 {details.group.meetingPoint} • Líder: {details.group.leader} • {details.group.members} membros
                </p>
              </div>
            </div>
          </Card>

          {/* Eventos + Ranking */}
          <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="grid gap-4">
              {details.events.length === 0 ? (
                <Card variant="elevated" className="p-6 text-center text-sm text-white/60">
                  Nenhum evento agendado para este grupo.
                </Card>
              ) : (
                details.events.map((event) => (
                  <EventCard
                    key={event.id}
                    action={
                      <AttendanceToggleButton
                        runEventId={event.id}
                        status={event.attendanceStatus}
                      />
                    }
                    event={event}
                  />
                ))
              )}
            </div>

            {details.ranking.length > 0 && (
              <Card variant="elevated" className="p-5">
                <h2 className="text-xl font-bold">Ranking interno</h2>
                <div className="mt-5 grid gap-3">
                  {details.ranking.map((entry) => (
                    <RankingCard key={`${entry.position}-${entry.name}`} entry={entry} />
                  ))}
                </div>
              </Card>
            )}
          </section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
