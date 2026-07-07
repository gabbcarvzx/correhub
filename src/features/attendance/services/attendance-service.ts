import { auth } from "@/auth";
import { cancelAttendance, findAttendanceForEvent, upsertAttendance } from "@/features/attendance/data/attendance-repository";
import { findEventById } from "@/features/events/data/events-repository";
import { getAuthenticatedTenant } from "@/lib/security/tenant";
import { logger } from "@/features/observability/logger";

export async function confirmAttendanceForCurrentUser(runEventId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const tenant = await getAuthenticatedTenant();

  const event = await findEventById(tenant.id, runEventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const result = await upsertAttendance({
    tenantId: tenant.id,
    runEventId,
    userId: session.user.id
  });

  logger.info("attendance.confirmed", {
    userId: session.user.id,
    eventId: runEventId,
    tenantId: tenant.id
  });

  return result;
}

export async function cancelAttendanceForCurrentUser(runEventId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const tenant = await getAuthenticatedTenant();

  const attendance = await findAttendanceForEvent(session.user.id, runEventId);

  if (!attendance) {
    throw new Error("Attendance not found.");
  }

  if (attendance.tenantId !== tenant.id) {
    throw new Error("Cross-tenant access denied.");
  }

  const result = await cancelAttendance({
    attendanceId: attendance.id
  });

  logger.info("attendance.cancelled", {
    userId: session.user.id,
    eventId: runEventId,
    tenantId: tenant.id
  });

  return result;
}
