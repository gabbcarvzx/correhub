import { NextResponse } from "next/server";
import { z } from "zod";
import { moderatePartner } from "@/features/partners/services/partners-service";
import { requireSessionWithRole } from "@/lib/security/policies";
import { checkRateLimit, getRateLimitHeaders, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";

const moderationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewNotes: z.string().max(1000).optional()
});

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    identifier: `admin:${ip}`,
    config: RATE_LIMITS.ADMIN_ACTIONS,
    scope: "ip",
    storeName: "admin"
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas requisicoes. Tente novamente em instantes." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimit)
      }
    );
  }

  try {
    const user = await requireSessionWithRole(["ADMIN"]);

    const { id } = await context.params;

    if (!z.string().min(1).safeParse(id).success) {
      return NextResponse.json(
        { error: "ID invalido." },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const body = await request.json();
    const parsed = moderationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const partner = await moderatePartner({
      actorUserId: user.id,
      partnerId: id,
      status: parsed.data.status,
      reviewNotes: parsed.data.reviewNotes
    });

    return NextResponse.json({ partner }, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    const status = message.includes("Unauthorized") ? 401
      : message.includes("not found") ? 404
      : message.includes("permission") || message.includes("denied") || message.includes("Insufficient") ? 403
      : 400;
    return NextResponse.json(
      { error: message },
      { status, headers: getRateLimitHeaders(rateLimit) }
    );
  }
}
