import { z } from "zod";

const privateEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().min(1, "UPSTASH_REDIS_REST_URL is required").optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "UPSTASH_REDIS_REST_TOKEN is required").optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).default("correhub-private"),
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 characters").optional(),
  UPLOAD_MAX_SIZE_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("CorreHub"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;
type PublicEnv = z.infer<typeof publicEnvSchema>;
type Env = PrivateEnv & PublicEnv;

let parsedEnv: Env | null = null;

/**
 * Detecta se estamos na fase de build do Next.js.
 * Usa NEXT_PHASE que o Next.js seta durante o build.
 * NÃO usa fallback de DATABASE_URL pois isso mascararia erros em runtime.
 */
function isBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NEXT_PHASE === "phase-static-export"
  );
}

/**
 * Detecta se estamos em ambiente de teste.
 */
function isTestEnv(): boolean {
  return process.env.NODE_ENV === "test";
}

/**
 * Fallback seguro para a fase de build do Next.js.
 * Retorna valores mínimos que permitem o build sem crash,
 * mas que JAMAIS serão usados em runtime.
 */
function getBuildSafeEnv(): Env {
  const publicVars = parsePublicEnv();
  return {
    ...publicVars,
    DATABASE_URL: "",
    DIRECT_URL: "",
    AUTH_SECRET: "this-is-a-build-fallback-that-will-fail-in-runtime",
    AUTH_URL: undefined,
    AUTH_TRUST_HOST: undefined,
    GOOGLE_CLIENT_ID: undefined,
    GOOGLE_CLIENT_SECRET: undefined,
    NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) ?? "development",
    SUPABASE_URL: undefined,
    SUPABASE_ANON_KEY: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
    SUPABASE_STORAGE_BUCKET: "correhub-private",
    UPLOAD_MAX_SIZE_BYTES: 5 * 1024 * 1024,
    LOG_LEVEL: "info",
  };
}

/**
 * Fallback seguro para testes.
 */
function getTestSafeEnv(): Env {
  const publicVars = parsePublicEnv();
  return {
    ...publicVars,
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test",
    DIRECT_URL: process.env.DIRECT_URL ?? "postgresql://test:test@localhost:5432/test",
    AUTH_SECRET: process.env.AUTH_SECRET ?? "test-secret-at-least-32-characters-long!!",
    AUTH_URL: process.env.AUTH_URL ?? "http://localhost:3000",
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NODE_ENV: "test",
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET ?? "correhub-private",
    UPLOAD_MAX_SIZE_BYTES: Number(process.env.UPLOAD_MAX_SIZE_BYTES) || (5 * 1024 * 1024),
    LOG_LEVEL: (process.env.LOG_LEVEL as Env["LOG_LEVEL"]) ?? "info",
  };
}

/**
 * Valida e retorna as variáveis de ambiente reais do process.env.
 * Esta é a função chamada em RUNTIME.
 */
function parseRuntimeEnv(): Env {
  const privResult = privateEnvSchema.safeParse(process.env);
  if (!privResult.success) {
    const missing = privResult.error.issues
      .filter((i) => i.message.includes("Required"))
      .map((i) => i.path.join("."));
    const errorMsg =
      missing.length > 0
        ? `Missing required environment variables:\n  ${missing.join("\n  ")}`
        : `Invalid environment variables:\n  ${privResult.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`;
    throw new Error(errorMsg);
  }

  const pubResult = publicEnvSchema.safeParse(process.env);
  const publicVars = pubResult.success ? (pubResult.data as PublicEnv) : publicEnvSchema.parse({});

  return {
    ...privResult.data,
    ...publicVars,
  } as Env;
}

function parsePublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse(process.env);
  return result.success ? (result.data as PublicEnv) : publicEnvSchema.parse({});
}

/**
 * Obtém o ambiente atual.
 * - Build: retorna fallback seguro (não valida vars obrigatórias)
 * - Test: retorna fallback com suporte a override via process.env
 * - Runtime: valida e retorna vars reais
 */
export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  if (isBuildPhase()) {
    parsedEnv = getBuildSafeEnv();
    return parsedEnv;
  }

  if (isTestEnv()) {
    parsedEnv = getTestSafeEnv();
    return parsedEnv;
  }

  // Runtime — valida vars reais
  parsedEnv = parseRuntimeEnv();

  return parsedEnv;
}

/**
 * Proxy que permite acessar env vars como `env.DATABASE_URL`.
 * Em build/test, retorna fallbacks seguros.
 * Em runtime, valida e retorna valores reais de process.env.
 */
export const env = new Proxy({} as Env, {
  get(_, prop: string | symbol) {
    const key = prop as keyof Env;
    const currentEnv = getEnv();
    const value = currentEnv[key];

    // Em runtime, se algum valor obrigatório estiver vazio, alerta
    if (
      !isBuildPhase() &&
      !isTestEnv() &&
      (value === undefined || value === "") &&
      ["DATABASE_URL", "DIRECT_URL", "AUTH_SECRET"].includes(key)
    ) {
      console.error(`[env] CRITICAL: Environment variable ${key} is empty/undefined at runtime`);
    }

    return value;
  },
});

export function isProduction(): boolean {
  try { return getEnv().NODE_ENV === "production"; } catch { return false; }
}

export function isDevelopment(): boolean {
  try { return getEnv().NODE_ENV === "development"; } catch { return false; }
}

/**
 * Valida explicitamente as env vars em runtime.
 * Deve ser chamada na inicialização do app (ex: layout.tsx ou middleware).
 * Lança erro se vars obrigatórias estiverem faltando.
 */
export function validateRuntimeEnv(): void {
  if (isBuildPhase()) {
    // Build phase: não valida vars obrigatórias
    return;
  }

  try {
    const parsed = parseRuntimeEnv();
    parsedEnv = parsed;
  } catch (error) {
    console.error("[env] Runtime environment validation failed:", error);
    throw error;
  }
}
