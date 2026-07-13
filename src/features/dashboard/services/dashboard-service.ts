import { findLeaderEvents, findPublicEventsByTenant } from "@/features/events/data/events-repository";
import { findLeaderGroups, findPendingGroups } from "@/features/groups/data/groups-repository";
import { findApprovedPartnersByTenant, findPendingPartners } from "@/features/partners/data/partners-repository";
import { findLatestCityRanking } from "@/features/rankings/data/rankings-repository";
import { db } from "@/lib/db";
import { getCurrentTenant } from "@/lib/security/tenant";
import { logger, getLogger } from "@/features/observability/logger";

/**
 * Busca dados do dashboard para um corredor (RUNNER).
 * Lança erro se o usuário não existir.
 */
export async function getRunnerDashboardData(userId: string) {
  const tenant = await getCurrentTenant();
  const log = getLogger({ tenantId: tenant.id, userId });

  const [user, events, checkIns, rankings, groups, partners, achievements] =
    await Promise.all([
      db.user.findFirst({
        where: { id: userId, tenantId: tenant.id, deletedAt: null },
      }),
      findPublicEventsByTenant(tenant.id),
      db.checkIn.findMany({
        where: { tenantId: tenant.id, userId, deletedAt: null },
        include: { runEvent: { select: { title: true } } },
        orderBy: { checkedInAt: "desc" },
        take: 3,
      }),
      findLatestCityRanking(tenant.id),
      db.group.findMany({
        where: {
          tenantId: tenant.id,
          deletedAt: null,
          members: { some: { userId, deletedAt: null } },
        },
        orderBy: { createdAt: "asc" },
        take: 1,
      }),
      findApprovedPartnersByTenant(tenant.id),
      db.userAchievement.findMany({
        where: { tenantId: tenant.id, userId },
        include: { achievement: { select: { name: true } } },
        take: 3,
      }),
    ]);

  if (!user) {
    log.error("dashboard.user_not_found");
    throw new Error("Usuário não encontrado.");
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthKm = checkIns
    .filter(
      (entry) =>
        entry.checkedInAt.getMonth() === currentMonth &&
        entry.checkedInAt.getFullYear() === currentYear
    )
    .reduce((total, entry) => total + (entry.kmReported ?? 0), 0);

  const rankingEntry = rankings.find((entry) => entry.userId === userId);
  const upcomingEvents = events.slice(0, 3).map((event) => ({
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
  }));

  return {
    nextEvent: upcomingEvents[0] ?? null,
    lastCheckIns: checkIns.map((entry) => entry.runEvent.title),
    monthKm,
    rankingPosition: rankingEntry?.position ?? 0,
    mainGroup: groups[0]
      ? {
          id: groups[0].id,
          slug: groups[0].slug,
          name: groups[0].name,
          description: groups[0].description,
          leader: "",
          meetingPoint: groups[0].meetingPoint,
          members: 0,
          status: groups[0].status,
        }
      : null,
    nearbyPartners: partners.slice(0, 2).map((partner) => ({
      slug: partner.slug,
      name: partner.name,
      category: partner.category,
      description: partner.description,
      coupon: partner.couponCode ?? "Sem cupom",
      whatsapp: partner.whatsapp,
      instagram: partner.instagram ?? "",
      address: partner.address,
    })),
    upcomingEvents,
    achievements: achievements.map((entry) => entry.achievement.name),
  };
}

/**
 * Busca dados do dashboard para um líder de grupo.
 * Lança erro se o líder não tiver grupos.
 */
export async function getLeaderDashboardData(userId: string) {
  const tenant = await getCurrentTenant();
  const log = getLogger({ tenantId: tenant.id, userId });

  const [groups, events, checkIns] = await Promise.all([
    findLeaderGroups(tenant.id, userId),
    findLeaderEvents(tenant.id, userId),
    db.checkIn.count({
      where: {
        tenantId: tenant.id,
        deletedAt: null,
        runEvent: { group: { leaderUserId: userId } },
      },
    }),
  ]);

  if (groups.length === 0) {
    log.warn("dashboard.leader_no_groups", { userId });
    throw new Error("Nenhum grupo encontrado para este líder.");
  }

  return {
    group: groups[0],
    approvalStatus: groups[0].status,
    metrics: [
      { label: "Membros ativos", value: String(groups[0].members.length) },
      { label: "Eventos ativos", value: String(events.length) },
      { label: "Check-ins no tenant", value: String(checkIns) },
    ],
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
    })),
  };
}

/**
 * Busca dados do dashboard administrativo.
 * Retorna KPIs, grupos pendentes e parceiros pendentes.
 */
export async function getAdminDashboardData() {
  const tenant = await getCurrentTenant();
  const log = getLogger({ tenantId: tenant.id });

  const [
    users,
    groupsCount,
    eventsCount,
    checkInsCount,
    partnersCount,
    pendingGroups,
    pendingPartners,
  ] = await Promise.all([
    db.user.count({ where: { tenantId: tenant.id, deletedAt: null } }),
    db.group.count({ where: { tenantId: tenant.id, deletedAt: null } }),
    db.runEvent.count({ where: { tenantId: tenant.id, deletedAt: null } }),
    db.checkIn.count({ where: { tenantId: tenant.id, deletedAt: null } }),
    db.partner.count({ where: { tenantId: tenant.id, deletedAt: null } }),
    findPendingGroups(tenant.id),
    findPendingPartners(tenant.id),
  ]);

  log.info("dashboard.admin.loaded", {
    users,
    groupsCount,
    eventsCount,
    checkInsCount,
    partnersCount,
  });

  return {
    kpis: [
      { label: "Usuarios", value: String(users) },
      { label: "Grupos", value: String(groupsCount) },
      { label: "Eventos", value: String(eventsCount) },
      { label: "Check-ins", value: String(checkInsCount) },
      { label: "Parceiros", value: String(partnersCount) },
    ],
    pendingGroups,
    pendingPartners,
  };
}
