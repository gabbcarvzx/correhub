import { db } from "@/lib/db";

export const PUBLIC_EVENT_VIEW_NAME = "public_events";

export const PUBLIC_EVENT_VIEW_COLUMNS = [
  "id",
  "tenantId",
  "groupId",
  "title",
  "description",
  "eventType",
  "date",
  "startTime",
  "endTime",
  "location",
  "distance",
  "level",
  "suggestedPace",
  "capacity"
] as const;

interface PublicEventRow {
  id: string;
  tenantId: string;
  groupId: string;
  title: string;
  description: string;
  eventType: string;
  date: Date;
  startTime: Date;
  endTime: Date | null;
  location: string;
  distance: string;
  level: string;
  suggestedPace: string | null;
  capacity: number | null;
  groupSlug: string;
  groupName: string;
  confirmedCount: number;
}

function mapPublicEventRow(row: PublicEventRow) {
  return {
    id: row.id,
    slug: row.id,
    tenantId: row.tenantId,
    groupId: row.groupId,
    title: row.title,
    description: row.description,
    eventType: row.eventType,
    date: row.date,
    startTime: row.startTime,
    endTime: row.endTime,
    location: row.location,
    distance: row.distance,
    level: row.level,
    suggestedPace: row.suggestedPace,
    capacity: row.capacity,
    group: {
      slug: row.groupSlug,
      name: row.groupName
    },
    attendances: Array.from({ length: row.confirmedCount }, (_, index) => ({ id: `${row.id}:${index}` }))
  };
}

export async function findPublicEventsByTenant(tenantId: string) {
  const events = await db.$queryRaw<PublicEventRow[]>`
    select
      pe."id",
      pe."tenantId",
      pe."groupId",
      pe."title",
      pe."description",
      pe."eventType",
      pe."date",
      pe."startTime",
      pe."endTime",
      pe."location",
      pe."distance",
      pe."level",
      pe."suggestedPace",
      pe."capacity",
      g."slug" as "groupSlug",
      g."name" as "groupName",
      count(a."id")::int as "confirmedCount"
    from public.public_events pe
    join public."Group" g
      on g."id" = pe."groupId"
      and g."tenantId" = pe."tenantId"
    left join public."Attendance" a
      on a."runEventId" = pe."id"
      and a."tenantId" = pe."tenantId"
      and a."status" = 'CONFIRMED'
      and a."deletedAt" is null
    where pe."tenantId" = ${tenantId}
    group by
      pe."id",
      pe."tenantId",
      pe."groupId",
      pe."title",
      pe."description",
      pe."eventType",
      pe."date",
      pe."startTime",
      pe."endTime",
      pe."location",
      pe."distance",
      pe."level",
      pe."suggestedPace",
      pe."capacity",
      g."slug",
      g."name"
    order by pe."date" asc
  `;

  return events.map(mapPublicEventRow);
}

export async function findPublicGroupEventsByTenant(tenantId: string, groupId: string) {
  const events = await db.$queryRaw<PublicEventRow[]>`
    select
      pe."id",
      pe."tenantId",
      pe."groupId",
      pe."title",
      pe."description",
      pe."eventType",
      pe."date",
      pe."startTime",
      pe."endTime",
      pe."location",
      pe."distance",
      pe."level",
      pe."suggestedPace",
      pe."capacity",
      g."slug" as "groupSlug",
      g."name" as "groupName",
      count(a."id")::int as "confirmedCount"
    from public.public_events pe
    join public."Group" g
      on g."id" = pe."groupId"
      and g."tenantId" = pe."tenantId"
    left join public."Attendance" a
      on a."runEventId" = pe."id"
      and a."tenantId" = pe."tenantId"
      and a."status" = 'CONFIRMED'
      and a."deletedAt" is null
    where pe."tenantId" = ${tenantId}
      and pe."groupId" = ${groupId}
    group by
      pe."id",
      pe."tenantId",
      pe."groupId",
      pe."title",
      pe."description",
      pe."eventType",
      pe."date",
      pe."startTime",
      pe."endTime",
      pe."location",
      pe."distance",
      pe."level",
      pe."suggestedPace",
      pe."capacity",
      g."slug",
      g."name"
    order by pe."date" asc
  `;

  return events.map(mapPublicEventRow);
}

export async function findGroupEvents(tenantId: string, groupId: string) {
  return db.runEvent.findMany({
    where: {
      tenantId,
      groupId,
      deletedAt: null
    },
    include: {
      group: {
        select: {
          slug: true,
          name: true
        }
      },
      attendances: {
        where: {
          status: "CONFIRMED",
          deletedAt: null
        },
        select: {
          id: true
        }
      }
    },
    orderBy: {
      date: "asc"
    }
  });
}

export async function findEventById(tenantId: string, eventId: string) {
  return db.runEvent.findFirst({
    where: {
      id: eventId,
      tenantId,
      deletedAt: null
    },
    include: {
      group: {
        select: {
          id: true,
          slug: true,
          name: true
        }
      }
    }
  });
}

export async function findLeaderEvents(tenantId: string, leaderUserId: string) {
  return db.runEvent.findMany({
    where: {
      tenantId,
      deletedAt: null,
      group: {
        leaderUserId
      }
    },
    include: {
      group: {
        select: {
          slug: true,
          name: true
        }
      },
      attendances: {
        where: {
          deletedAt: null,
          status: "CONFIRMED"
        },
        select: {
          id: true
        }
      }
    },
    orderBy: {
      date: "asc"
    }
  });
}
