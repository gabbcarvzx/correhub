import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { DistanceType } from "@prisma/client";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit, getRateLimitHeaders, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { logger } from "@/features/observability/logger";

const BCRYPT_ROUNDS = 12;

const DISTANCE_MAP: Record<string, DistanceType> = {
  "5": DistanceType.KM_5,
  "10": DistanceType.KM_10,
  "15": DistanceType.KM_15,
  "21": DistanceType.KM_21,
  OPEN: DistanceType.OPEN,
};

/**
 * POST /api/v1/auth/register
 *
 * Cria um novo usuário corredor no tenant ativo mais antigo.
 * Em produção com múltiplos tenants, receber o tenantId via header ou subdomínio.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = await checkRateLimit({
    identifier: `register:${ip}`,
    config: RATE_LIMITS.API_GENERAL,
    scope: "ip",
    storeName: "register",
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Muitas tentativas. Tente novamente em instantes." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimit),
      }
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0] ?? "Dados inválidos.";
      return NextResponse.json(
        { message: firstError },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const { name, email, password, city, preferredDistance } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Verifica se email já existe (independente de tenant)
    const existing = await db.user.findFirst({
      where: { email: normalizedEmail, deletedAt: null },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Este email já está cadastrado." },
        { status: 409, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Busca o tenant — em um sistema multi-tenant real, isso viria do subdomínio/header
    // Por enquanto, usa o primeiro tenant ativo como padrão
    const tenant = await db.tenant.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });

    if (!tenant) {
      logger.error("tenant.not_found", { action: "register" });
      return NextResponse.json(
        { message: "Erro interno. Nenhum tenant ativo encontrado." },
        { status: 500, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const passwordHash = hashSync(password, BCRYPT_ROUNDS);

    const user = await db.user.create({
      data: {
        tenantId: tenant.id,
        name,
        email: normalizedEmail,
        passwordHash,
        city,
        preferredDistance: preferredDistance
          ? (DISTANCE_MAP[preferredDistance] ?? null)
          : null,
      },
    });

    logger.info("auth.register.success", {
      userId: user.id,
      tenantId: tenant.id,
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201, headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("auth.register.failed", {
      error: errorMessage,
    });
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
