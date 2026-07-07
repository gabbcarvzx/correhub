import { groups as demoGroups } from "@/features/demo/data/demo-data";
import { findApprovedGroupBySlug, findApprovedGroupsByTenant, findLeaderGroups, findPendingGroups, updateGroupModeration } from "@/features/groups/data/groups-repository";
import { findPublicGroupEventsByTenant } from "@/features/events/data/events-repository";
import { ranking as demoRanking } from "@/features/demo/data/demo-data";
import type { GroupCardModel, RankingCardModel } from "@/features/shared/types";
import { withFallback } from "@/features/shared/services/fallback";
import { getCurrentTenant, getAuthenticatedTenant } from "@/lib/security/tenant";
import { createAuditLog } from "@/features/admin/data/audit-log-repository";

export async function listPublicGroups(): Promise<GroupCardModel[]> {
  const tenant = await getCurrentTenant();

  return withFallback({
    query: async () => {
      const records = await findApprovedGroupsByTenant(tenant.id);
      return records.map((group) => ({
        id: group.id,
        slug: group.slug,
        name: group.name,
        description: group.description,
        leader: group.leader.name,
        meetingPoint: group.meetingPoint,
        members: group.members.length,
        status: group.status
      }));
    },
    fallback: () =>
      demoGroups
        .filter((group) => group.status === "APPROVED")
        .map((group) => ({
          id: group.id,
          slug: group.slug,
          name: group.name,
          description: group.description,
          leader: group.leader,
          meetingPoint: group.meetingPoint,
          members: group.members,
          status: "APPROVED" as const
        })),
    isEmpty: (value) => value.length === 0
  });
}

export async function getPublicGroupDetails(slug: string) {
  const tenant = await getCurrentTenant();

  return withFallback({
    query: async () => {
      const group = await findApprovedGroupBySlug(tenant.id, slug);

      if (!group) {
        return null;
      }

      const events = await findPublicGroupEventsByTenant(tenant.id, group.id);

      const mappedRanking: RankingCardModel[] = (group.members ?? []).map((member, index) => ({
        position: index + 1,
        name: member.user?.name ?? "Corredor",
        group: group.name,
        attendances: 0,
        km: 0
      }));

      return {
        group: {
          id: group.id,
          slug: group.slug,
          name: group.name,
          description: group.description,
          leader: group.leader.name,
          meetingPoint: group.meetingPoint,
          members: group.members.length,
          status: group.status
        },
        events: events.map((event) => ({
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
          attendanceStatus: null
        })),
        ranking: mappedRanking
      };
    },
    fallback: () => {
      const group = demoGroups.find((entry) => entry.slug === slug && entry.status === "APPROVED");
      if (!group) {
        return null;
      }
      return {
        group: {
          id: group.id,
          slug: group.slug,
          name: group.name,
          description: group.description,
          leader: group.leader,
          meetingPoint: group.meetingPoint,
          members: group.members,
          status: "APPROVED" as const
        },
        events: [],
        ranking: demoRanking
      };
    }
  });
}

export async function listLeaderGroups(userId: string) {
  const tenant = await getCurrentTenant();
  return findLeaderGroups(tenant.id, userId);
}

export async function listPendingGroupsForAdmin() {
  const tenant = await getAuthenticatedTenant();
  return findPendingGroups(tenant.id);
}

export async function moderateGroup(input: {
  actorUserId: string;
  groupId: string;
  status: "APPROVED" | "REJECTED";
  reviewNotes?: string;
}) {
  const tenant = await getAuthenticatedTenant();
  const group = await updateGroupModeration({
    groupId: input.groupId,
    tenantId: tenant.id,
    status: input.status,
    reviewNotes: input.reviewNotes,
    reviewedById: input.actorUserId
  });

  await createAuditLog({
    tenantId: tenant.id,
    actorUserId: input.actorUserId,
    entityType: "GROUP",
    entityId: input.groupId,
    action: input.status,
    metadata: {
      reviewNotes: input.reviewNotes ?? null
    }
  });

  return group;
}
