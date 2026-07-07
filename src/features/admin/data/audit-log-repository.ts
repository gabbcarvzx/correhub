import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export async function createAuditLog(input: {
  tenantId: string;
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  return db.auditLog.create({
    data: {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      metadata: (input.metadata ?? null) as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput
    }
  });
}
