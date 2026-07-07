import { auth } from "@/auth";
import { db } from "@/lib/db";
import { findCheckInByEventAndUser } from "@/features/check-in/data/check-in-repository";
import { findEventById } from "@/features/events/data/events-repository";
import { getAuthenticatedTenant } from "@/lib/security/tenant";
import { logger } from "@/features/observability/logger";

export function validateCheckInWindow(now: Date, opensAt: Date, closesAt: Date) {
  return now >= opensAt && now <= closesAt;
}

export function ensureCheckInAllowed(input: {
  alreadyCheckedIn: boolean;
  now: Date;
  opensAt: Date;
  closesAt: Date;
}) {
  if (input.alreadyCheckedIn) {
    throw new Error("Check-in already registered.");
  }

  if (!validateCheckInWindow(input.now, input.opensAt, input.closesAt)) {
    throw new Error("Check-in window is closed.");
  }
}

export async function registerCheckInForCurrentUser(input: {
  runEventId: string;
  method?: string;
  kmReported?: number;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const tenant = await getAuthenticatedTenant();

  const event = await findEventById(tenant.id, input.runEventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const existing = await findCheckInByEventAndUser(event.id, session.user.id);

  if (existing) {
    return existing;
  }

  ensureCheckInAllowed({
    alreadyCheckedIn: false,
    now: new Date(),
    opensAt: event.checkInOpensAt,
    closesAt: event.checkInClosesAt
  });

  // Transaction prevents race conditions between duplicate check-ins
  const result = await db.$transaction(async (tx) => {
    const existingInTx = await tx.checkIn.findFirst({
      where: {
        runEventId: event.id,
        userId: session.user.id,
        deletedAt: null
      }
    });

    if (existingInTx) {
      return existingInTx;
    }

    const attendance = await tx.attendance.upsert({
      where: {
        runEventId_userId: {
          runEventId: event.id,
          userId: session.user.id
        }
      },
      update: {
        status: "CONFIRMED",
        cancelledAt: null,
        deletedAt: null,
        deletedBy: null
      },
      create: {
        tenantId: tenant.id,
        runEventId: event.id,
        userId: session.user.id,
        status: "CONFIRMED"
      }
    });

    return tx.checkIn.create({
      data: {
        tenantId: tenant.id,
        runEventId: event.id,
        userId: session.user.id,
        attendanceId: attendance.id,
        method: input.method ?? "QR_LINK",
        kmReported: input.kmReported
      }
    });
  });

  logger.info("check_in.registered", {
    userId: session.user.id,
    eventId: event.id,
    tenantId: tenant.id
  });

  return result;
}
