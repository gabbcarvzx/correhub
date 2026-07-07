import { z } from "zod";

const privateEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info")
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("CorreHub"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional()
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;
type PublicEnv = z.infer<typeof publicEnvSchema>;
type Env = PrivateEnv & PublicEnv;

let parsedEnv: Env | null = null;

function getPublicEnv(): PublicEnv {
  const result = publicEnvSchema.safeParse(process.env);
  return result.success ? (result.data as PublicEnv) : publicEnvSchema.parse({});
}

function getTestEnv(): Env {
  return {
    ...getPublicEnv(),
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    DIRECT_URL: "postgresql://test:test@localhost:5432/test",
    AUTH_SECRET: "test-secret-at-least-32-characters-long!!",
    AUTH_URL: "http://localhost:3000",
    NODE_ENV: "test",
    LOG_LEVEL: "info"
  };
}

function getBuildEnv(): Env {
  return {
    ...getPublicEnv(),
    DATABASE_URL: "",
    DIRECT_URL: "",
    AUTH_SECRET: "build-fallback-secret-32-chars-minimum!!",
    AUTH_URL: undefined,
    AUTH_TRUST_HOST: undefined,
    GOOGLE_CLIENT_ID: undefined,
    GOOGLE_CLIENT_SECRET: undefined,
    NODE_ENV: process.env.NODE_ENV as Env["NODE_ENV"] ?? "development",
    SUPABASE_URL: undefined,
    SUPABASE_ANON_KEY: undefined,
    SUPABASE_SERVICE_ROLE_KEY: undefined,
    LOG_LEVEL: (process.env.LOG_LEVEL as Env["LOG_LEVEL"]) ?? "info"
  };
}

function getEnv(): Env {
  if (!parsedEnv) {
    if (process.env.NODE_ENV === "test") {
      parsedEnv = getTestEnv();
      return parsedEnv;
    }

    parsedEnv = getBuildEnv();
  }
  return parsedEnv;
}

export const env = new Proxy({} as Env, {
  get(_, prop: string | symbol) {
    return getEnv()[prop as keyof Env];
  }
});

export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}

export function validateRuntimeEnv(): void {
  const privResult = privateEnvSchema.safeParse(process.env);
  if (!privResult.success) {
    const missing = privResult.error.issues
      .filter((i) => i.message.includes("Required"))
      .map((i) => i.path.join("."));
    if (missing.length > 0) {
      throw new Error(
        `Missing required runtime environment variables:\n  ${missing.join("\n  ")}\n\n` +
          "Check .env.example for the complete list."
      );
    }
    console.error("Invalid runtime environment variables:", JSON.stringify(privResult.error.issues, null, 2));
    throw new Error("Invalid runtime environment configuration");
  }
  const pubResult = publicEnvSchema.safeParse(process.env);
  parsedEnv = {
    ...privResult.data,
    ...(pubResult.success ? (pubResult.data as PublicEnv) : publicEnvSchema.parse({}))
  } as Env;
}
