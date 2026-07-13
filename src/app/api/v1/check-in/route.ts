import { NextResponse } from "next/server";
import { z } from "zod";
import { registerCheckInForCurrentUser } from "@/features/check-in/services/check-in-service";
import { checkRateLimit, getRateLimitHeaders, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";

const checkInSchema = z.object({
  runEventId: z.string().min(1, "runEventId is required."),
  kmReported: z.number().min(0).max(999).optional()
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit({
    identifier: `check-in:${ip}`,
    config: RATE_LIMITS.CHECK_IN,
    scope: "ip",
    storeName: "check-in"
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
    const body = await request.json();
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const checkIn = await registerCheckInForCurrentUser({
      runEventId: parsed.data.runEventId,
      kmReported: parsed.data.kmReported
    });

    return NextResponse.json({ checkIn }, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    const status = message.includes("Unauthorized") ? 401
      : message.includes("not found") ? 404
      : message.includes("denied") ? 403
      : message.includes("blocked") || message.includes("bloqueada") ? 429
      : 400;
    return NextResponse.json(
      { error: message },
      { status, headers: getRateLimitHeaders(rateLimit) }
    );
  }
}
