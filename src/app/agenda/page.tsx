import { AppShell } from "@/components/layout/app-shell";
import { EventCard } from "@/components/shared/event-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { AttendanceToggleButton } from "@/features/attendance/components/attendance-toggle-button";
import { listPublicEvents } from "@/features/events/services/events-service";

export default async function AgendaPage() {
  const events = await listPublicEvents();

  return (
    <AppShell>
      <main className="app-shell py-8">
        <SectionHeading eyebrow="Agenda" title="Treinos e eventos da semana" description="Descubra treinos, longoes, corridas oficiais e encontros da comunidade." />
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} action={<AttendanceToggleButton runEventId={event.id} status={event.attendanceStatus} />} event={event} />
          ))}
        </section>
      </main>
    </AppShell>
  );
}
