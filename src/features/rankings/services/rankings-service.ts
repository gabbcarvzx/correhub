import { ranking as demoRanking } from "@/features/demo/data/demo-data";
import { findLatestCityRanking } from "@/features/rankings/data/rankings-repository";
import type { RankingCardModel } from "@/features/shared/types";
import { withFallback } from "@/features/shared/services/fallback";
import { db } from "@/lib/db";
import { getCurrentTenant } from "@/lib/security/tenant";

export async function listCityRanking(): Promise<RankingCardModel[]> {
  const tenant = await getCurrentTenant();

  return withFallback({
    query: async () => {
      const snapshots = await findLatestCityRanking(tenant.id);

      if (snapshots.length === 0) {
        return [];
      }

      const userIds = [...new Set(snapshots.map((entry) => entry.userId))];
      const groupIds = [...new Set(snapshots.map((entry) => entry.groupId).filter(Boolean))] as string[];

      const [users, groups] = await Promise.all([
        db.user.findMany({
          where: {
            id: {
              in: userIds
            }
          },
          select: {
            id: true,
            name: true
          }
        }),
        groupIds.length > 0
          ? db.group.findMany({
              where: {
                id: {
                  in: groupIds
                }
              },
              select: {
                id: true,
                name: true
              }
            })
          : Promise.resolve([])
      ]);

      const userMap = new Map(users.map((user) => [user.id, user.name]));
      const groupMap = new Map(groups.map((group) => [group.id, group.name]));

      return snapshots.map((entry) => ({
        position: entry.position,
        name: userMap.get(entry.userId) ?? "Corredor",
        group: entry.groupId ? (groupMap.get(entry.groupId) ?? "Sem grupo") : "Cidade",
        attendances: entry.attendanceCount,
        km: entry.kmTotal
      }));
    },
    fallback: () => demoRanking,
    isEmpty: (value) => value.length === 0
  });
}
