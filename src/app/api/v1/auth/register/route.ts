import { NextResponse } from "next/server";
import { hashSync } from "bcryptjs";
import { DistanceType } from "@prisma/client";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit, getRateLimitHeaders, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";

const BCRYPT_ROUNDS = 10;
const TENANT_SLUG = "sao-lourenco-da-mata";

const DISTANCE_MAP: Record<string, DistanceType> = {
  "5": DistanceType.KM_5,
  "10": DistanceType.KM_10,
  "15": DistanceType.KM_15,
  "21": DistanceType.KM_21,
  "OPEN": DistanceType.OPEN,
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    identifier: `register:${ip}`,
    config: RATE_LIMITS.API_GENERAL,
    scope: "ip",
    storeName: "register"
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Muitas tentativas. Tente novamente em instantes." },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimit)
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

    const existing = await db.user.findFirst({
      where: { email, deletedAt: null }
    });

    if (existing) {
      return NextResponse.json(
        { message: "Este email já está cadastrado." },
        { status: 409, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const tenant = await db.tenant.findUnique({
      where: { slug: TENANT_SLUG }
    });

    if (!tenant) {
      return NextResponse.json(
        { message: "Erro interno. Tenant não encontrado." },
        { status: 500, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const passwordHash = hashSync(password, BCRYPT_ROUNDS);

    const user = await db.user.create({
      data: {
        tenantId: tenant.id,
        name,
        email,
        passwordHash,
        city,
        preferredDistance: preferredDistance ? DISTANCE_MAP[preferredDistance] ?? null : null
      }
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201, headers: getRateLimitHeaders(rateLimit) }
    );
  } catch {
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
