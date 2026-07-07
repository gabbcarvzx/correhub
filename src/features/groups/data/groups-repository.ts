import type { Group, GroupMember, User } from "@prisma/client";
import { db } from "@/lib/db";

export async function findApprovedGroupsByTenant(tenantId: string) {
  return db.group.findMany({
    where: {
      tenantId,
      status: "APPROVED",
      deletedAt: null
    },
    include: {
      leader: {
        select: {
          name: true
        }
      },
      members: {
        where: {
          deletedAt: null,
          status: "APPROVED"
        },
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function findApprovedGroupBySlug(tenantId: string, slug: string) {
  return db.group.findFirst({
    where: {
      tenantId,
      slug,
      status: "APPROVED",
      deletedAt: null
    },
    include: {
      leader: {
        select: {
          id: true,
          name: true
        }
      },
      members: {
        where: {
          deletedAt: null,
          status: "APPROVED"
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });
}

export async function findLeaderGroups(tenantId: string, leaderUserId: string) {
  return db.group.findMany({
    where: {
      tenantId,
      leaderUserId,
      deletedAt: null
    },
    include: {
      members: {
        where: {
          deletedAt: null,
          status: "APPROVED"
        },
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function findPendingGroups(tenantId: string) {
  return db.group.findMany({
    where: {
      tenantId,
      status: "PENDING",
      deletedAt: null
    },
    include: {
      leader: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function updateGroupModeration(input: {
  groupId: string;
  tenantId: string;
  status: "APPROVED" | "REJECTED";
  reviewNotes?: string;
  reviewedById: string;
}) {
  const group = await db.group.findFirst({
    where: {
      id: input.groupId,
      tenantId: input.tenantId,
      deletedAt: null
    }
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  return db.group.update({
    where: {
      id: group.id
    },
    data: {
      status: input.status,
      reviewNotes: input.reviewNotes,
      reviewedById: input.reviewedById,
      reviewedAt: new Date()
    }
  });
}

export type GroupWithRelations = Awaited<ReturnType<typeof findApprovedGroupBySlug>>;
export type GroupListRecord = Awaited<ReturnType<typeof findApprovedGroupsByTenant>>[number];
export type LeaderGroupRecord = Awaited<ReturnType<typeof findLeaderGroups>>[number];
export type GroupEntity = Group & { leader: Pick<User, "name">; members: Pick<GroupMember, "id">[] };
