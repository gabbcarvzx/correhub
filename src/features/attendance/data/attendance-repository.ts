import { db } from "@/lib/db";

export async function findAttendanceForEvent(userId: string, runEventId: string) {
  return db.attendance.findUnique({
    where: {
      runEventId_userId: {
        runEventId,
        userId
      }
    }
  });
}

export async function upsertAttendance(input: {
  tenantId: string;
  runEventId: string;
  userId: string;
}) {
  return db.attendance.upsert({
    where: {
      runEventId_userId: {
        runEventId: input.runEventId,
        userId: input.userId
      }
    },
    update: {
      status: "CONFIRMED",
      cancelledAt: null,
      deletedAt: null,
      deletedBy: null
    },
    create: {
      tenantId: input.tenantId,
      runEventId: input.runEventId,
      userId: input.userId,
      status: "CONFIRMED"
    }
  });
}

export async function cancelAttendance(input: {
  attendanceId: string;
}) {
  return db.attendance.update({
    where: {
      id: input.attendanceId
    },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date()
    }
  });
}

export async function findAttendanceStatusesForUser(tenantId: string, userId: string) {
  return db.attendance.findMany({
    where: {
      tenantId,
      userId,
      deletedAt: null
    },
    select: {
      runEventId: true,
      status: true
    }
  });
}
