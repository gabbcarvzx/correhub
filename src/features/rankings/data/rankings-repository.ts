import { db } from "@/lib/db";

export async function findLatestCityRanking(tenantId: string) {
  return db.rankingSnapshot.findMany({
    where: {
      tenantId,
      scopeType: "CITY"
    },
    orderBy: [{ periodKey: "desc" }, { position: "asc" }],
    take: 20
  });
}
