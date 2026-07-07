import { auth } from "@/auth";
import { events as demoEvents } from "@/features/demo/data/demo-data";
import { findAttendanceStatusesForUser } from "@/features/attendance/data/attendance-repository";
import { findGroupEvents, findLeaderEvents, findPublicEventsByTenant } from "@/features/events/data/events-repository";
import type { EventCardModel } from "@/features/shared/types";
import { withFallback } from "@/features/shared/services/fallback";
import { getCurrentTenant } from "@/lib/security/tenant";

function mapEvent(event: Awaited<ReturnType<typeof findPublicEventsByTenant>>[number], attendanceStatus?: "CONFIRMED" | "CANCELLED" | null): EventCardModel {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    groupName: event.group.name,
    groupSlug: event.group.slug,
    date: event.date.toISOString(),
    location: event.location,
    distance: event.distance,
    level: event.level,
    suggestedPace: event.suggestedPace ?? "Livre",
    confirmedCount: event.attendances.length,
    attendanceStatus
  };
}

export async function listPublicEvents(): Promise<EventCardModel[]> {
  const tenant = await getCurrentTenant();
  const session = await auth();

  return withFallback({
    query: async () => {
      const [events, attendanceStatuses] = await Promise.all([
        findPublicEventsByTenant(tenant.id),
        session?.user?.id ? findAttendanceStatusesForUser(tenant.id, session.user.id) : Promise.resolve([])
      ]);

      const attendanceMap = new Map(attendanceStatuses.map((status) => [status.runEventId, status.status]));

      return events.map((event) => mapEvent(event, attendanceMap.get(event.id) ?? null));
    },
    fallback: () => demoEvents,
    isEmpty: (value) => value.length === 0
  });
}

export async function listGroupEventsForTenant(groupId: string) {
  const tenant = await getCurrentTenant();
  return findGroupEvents(tenant.id, groupId);
}

export async function listLeaderEventsForUser(userId: string) {
  const tenant = await getCurrentTenant();
  return findLeaderEvents(tenant.id, userId);
}
