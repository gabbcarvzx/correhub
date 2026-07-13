import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentTenant } from "@/lib/security/tenant";
import { checkRateLimit, getRateLimitHeaders, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logger } from "@/features/observability/logger";

const searchSchema = z.object({
  q: z.string().min(1, "Query is required").max(200, "Query too long"),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit({
    identifier: `search:${ip}`,
    config: RATE_LIMITS.API_GENERAL,
    scope: "ip",
    storeName: "search",
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const limit = Number(searchParams.get("limit") ?? 5);

    const parsed = searchSchema.safeParse({ q, limit });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { q: query, limit: resultLimit } = parsed.data;
    const sanitizedQuery = query.trim().slice(0, 200);
    const tenant = await getCurrentTenant();

    const [groups, events, partners] = await Promise.all([
      db.group.findMany({
        where: {
          tenantId: tenant.id,
          status: "APPROVED",
          deletedAt: null,
          OR: [
            { name: { contains: sanitizedQuery, mode: "insensitive" } },
            { description: { contains: sanitizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          meetingPoint: true,
          leader: { select: { name: true } },
          _count: { select: { members: { where: { deletedAt: null, status: "APPROVED" } } } },
        },
        take: resultLimit,
        orderBy: { name: "asc" },
      }),
      db.runEvent.findMany({
        where: {
          tenantId: tenant.id,
          deletedAt: null,
          group: { status: "APPROVED", deletedAt: null },
          OR: [
            { title: { contains: sanitizedQuery, mode: "insensitive" } },
            { location: { contains: sanitizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          date: true,
          location: true,
          distance: true,
          eventType: true,
          group: { select: { slug: true, name: true } },
        },
        take: resultLimit,
        orderBy: { date: "asc" },
      }),
      db.partner.findMany({
        where: {
          tenantId: tenant.id,
          status: "APPROVED",
          deletedAt: null,
          OR: [
            { name: { contains: sanitizedQuery, mode: "insensitive" } },
            { category: { contains: sanitizedQuery, mode: "insensitive" } },
            { description: { contains: sanitizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          slug: true,
          name: true,
          category: true,
          description: true,
          couponCode: true,
        },
        take: resultLimit,
        orderBy: { featured: "desc" },
      }),
    ]);

    const results = {
      groups: groups.map((g) => ({
        id: g.id,
        slug: g.slug,
        name: g.name,
        description: g.description,
        meetingPoint: g.meetingPoint,
        leader: g.leader.name,
        members: g._count.members,
        href: `/grupos/${g.slug}`,
      })),
      events: events.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        date: e.date.toISOString(),
        location: e.location,
        distance: e.distance,
        type: e.eventType,
        groupName: e.group.name,
        groupSlug: e.group.slug,
        href: `/check-in/${e.slug}`,
      })),
      partners: partners.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        description: p.description,
        coupon: p.couponCode ?? "",
        href: `/parceiros/${p.slug}`,
      })),
    };

    logger.info("search.query", {
      query: sanitizedQuery.slice(0, 50),
      tenantId: tenant.id,
      results: results.groups.length + results.events.length + results.partners.length,
    });

    return NextResponse.json(results, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error) {
    logger.error("search.failed", { error: String(error) });
    return NextResponse.json(
      { error: "Erro interno ao realizar busca." },
      { status: 500 }
    );
  }
}
