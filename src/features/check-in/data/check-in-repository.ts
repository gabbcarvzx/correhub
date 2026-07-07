import { db } from "@/lib/db";

export async function findCheckInByEventAndUser(runEventId: string, userId: string) {
  return db.checkIn.findFirst({
    where: {
      runEventId,
      userId,
      deletedAt: null
    }
  });
}

export async function createCheckInRecord(input: {
  tenantId: string;
  runEventId: string;
  userId: string;
  attendanceId: string;
  method: string;
  kmReported?: number;
}) {
  return db.checkIn.create({
    data: input
  });
}

export async function upsertCheckInRecord(input: {
  tenantId: string;
  runEventId: string;
  userId: string;
  attendanceId: string;
  method: string;
  kmReported?: number;
}) {
  return db.checkIn.upsert({
    where: {
      attendanceId: input.attendanceId
    },
    create: input,
    update: {
      method: input.method,
      kmReported: input.kmReported,
      deletedAt: null,
      deletedBy: null
    }
  });
}
