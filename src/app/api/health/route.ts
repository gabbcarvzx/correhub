import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRedisHealth } from "@/lib/security/rate-limit";
import { logger } from "@/features/observability/logger";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};
  let overallStatus: "ok" | "degraded" | "error" = "ok";

  // Check PostgreSQL
  try {
    await db.$queryRaw`SELECT 1`;
    checks["database"] = "ok";
  } catch (error) {
    checks["database"] = "error";
    overallStatus = "error";
    logger.error("health.database_failed", { error: String(error) });
  }

  // Check Redis (Upstash)
  const redisHealthy = await checkRedisHealth();
  if (redisHealthy) {
    checks["redis"] = "ok";
  } else {
    checks["redis"] = "error";
    // Redis é critical para rate limit — degraded, mas não derruba o serviço
    if (overallStatus === "ok") {
      overallStatus = "degraded";
    }
    // Se UPSTASH_REDIS não está configurado, é esperado
    const hasRedisConfig = !!(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    );
    if (hasRedisConfig) {
      logger.warn("health.redis_unreachable", {});
    }
  }

  const statusCode = overallStatus === "error" ? 503 : overallStatus === "degraded" ? 200 : 200;

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage().rss,
      checks,
      version: "2.7.0",
      mode: "enterprise",
    },
    { status: statusCode }
  );
}
