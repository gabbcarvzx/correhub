import { findApprovedGroupBySlug, findApprovedGroupsByTenant, findLeaderGroups, findPendingGroups, updateGroupModeration } from "@/features/groups/data/groups-repository";
import { findPublicGroupEventsByTenant } from "@/features/events/data/events-repository";
import type { GroupCardModel, RankingCardModel } from "@/features/shared/types";
import { getCachedSignedUrl } from "@/features/uploads/signed-url-cache";
import { getCurrentTenant, getAuthenticatedTenant } from "@/lib/security/tenant";
import { createAuditLog } from "@/features/admin/data/audit-log-repository";
import { logger, getLogger } from "@/features/observability/logger";

export async function listPublicGroups(): Promise<GroupCardModel[]> {
  const tenant = await getCurrentTenant();
  const log = getLogger({ tenantId: tenant.id });

  const records = await findApprovedGroupsByTenant(tenant.id);

  if (records.length === 0) {
    log.info("groups.list.empty");
    return [];
  }

  // Converte storage keys para signed URLs em lote
  const signedUrls = await Promise.all(
    records.map(async (g) => ({
      slug: g.slug,
      signedLogoUrl: g.logoUrl ? await getCachedSignedUrl(g.logoUrl) : null,
    }))
  );
  const signedUrlMap = new Map(signedUrls.map((s) => [s.slug, s.signedLogoUrl]));

  return records.map((group) => ({
    id: group.id,
    slug: group.slug,
    name: group.name,
    description: group.description,
    leader: group.leader.name,
    meetingPoint: group.meetingPoint,
    members: group.members.length,
    status: group.status,
    logoUrl: signedUrlMap.get(group.slug) ?? null,
  }));
}

export async function getPublicGroupDetails(slug: string) {
  const tenant = await getCurrentTenant();
  const log = getLogger({ tenantId: tenant.id, slug });

  const group = await findApprovedGroupBySlug(tenant.id, slug);

  if (!group) {
    log.info("groups.details.not_found");
    return null;
  }

  const logoUrl = group.logoUrl ? await getCachedSignedUrl(group.logoUrl) : null;

  const events = await findPublicGroupEventsByTenant(tenant.id, group.id);

  const mappedRanking: RankingCardModel[] = (group.members ?? []).map((member, index) => ({
    position: index + 1,
    name: member.user?.name ?? "Corredor",
    group: group.name,
    attendances: 0,
    km: 0,
  }));

  return {
    group: {
      id: group.id,
      slug: group.slug,
      name: group.name,
      description: group.description,
      leader: group.leader.name,
      leaderUserId: group.leaderUserId,
      meetingPoint: group.meetingPoint,
      members: group.members.length,
      status: group.status,
      logoUrl,
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
      attendanceStatus: null,
    })),
    ranking: mappedRanking,
  };
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
    reviewedById: input.actorUserId,
  });

  await createAuditLog({
    tenantId: tenant.id,
    actorUserId: input.actorUserId,
    entityType: "GROUP",
    entityId: input.groupId,
    action: input.status,
    metadata: {
      reviewNotes: input.reviewNotes ?? null,
    },
  });

  return group;
}
