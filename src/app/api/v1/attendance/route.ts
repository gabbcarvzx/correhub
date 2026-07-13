import { NextResponse } from "next/server";
import { z } from "zod";
import { cancelAttendanceForCurrentUser, confirmAttendanceForCurrentUser } from "@/features/attendance/services/attendance-service";
import { checkRateLimit, getRateLimitHeaders, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";

const attendanceSchema = z.object({
  runEventId: z.string().min(1, "runEventId is required.")
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit({
    identifier: `attendance:${ip}`,
    config: RATE_LIMITS.ATTENDANCE,
    scope: "ip",
    storeName: "attendance"
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
    const parsed = attendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const attendance = await confirmAttendanceForCurrentUser(parsed.data.runEventId);
    return NextResponse.json({ attendance }, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    const status = message.includes("Unauthorized") ? 401
      : message.includes("not found") ? 404
      : message.includes("denied") ? 403
      : 400;
    return NextResponse.json(
      { error: message },
      { status, headers: getRateLimitHeaders(rateLimit) }
    );
  }
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit({
    identifier: `attendance:${ip}`,
    config: RATE_LIMITS.ATTENDANCE,
    scope: "ip",
    storeName: "attendance"
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
    const parsed = attendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos.", details: parsed.error.flatten().fieldErrors },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const attendance = await cancelAttendanceForCurrentUser(parsed.data.runEventId);
    return NextResponse.json({ attendance }, { headers: getRateLimitHeaders(rateLimit) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error.";
    const status = message.includes("Unauthorized") ? 401
      : message.includes("not found") ? 404
      : message.includes("denied") ? 403
      : 400;
    return NextResponse.json(
      { error: message },
      { status, headers: getRateLimitHeaders(rateLimit) }
    );
  }
}
