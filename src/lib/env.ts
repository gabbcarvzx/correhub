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

let parsedEnv: (Partial<PrivateEnv> & PublicEnv) | null = null;
let validated = false;

function getEnv(): Readonly<Partial<PrivateEnv> & PublicEnv> {
  if (!parsedEnv) {
    if (process.env.NODE_ENV === "test") {
      parsedEnv = privateEnvSchema.parse({
        DATABASE_URL: "postgresql://test:test@localhost:5432/test",
        DIRECT_URL: "postgresql://test:test@localhost:5432/test",
        AUTH_SECRET: "test-secret-at-least-32-characters-long!!",
        AUTH_URL: "http://localhost:3000",
        NODE_ENV: "test"
      });
      return parsedEnv;
    }

    const publicResult = publicEnvSchema.safeParse(process.env);
    if (!publicResult.success) {
      console.error("Invalid public env:", JSON.stringify(publicResult.error.issues));
    }

    parsedEnv = {
      ...(publicResult.success ? (publicResult.data as PublicEnv) : publicEnvSchema.parse({})),
      NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") ?? "development"
    } as Partial<PrivateEnv> & PublicEnv;
  }
  return parsedEnv;
}

export const env = new Proxy({} as PrivateEnv & PublicEnv, {
  get(_, prop: string | symbol) {
    return getEnv()[prop as keyof (PrivateEnv & PublicEnv)];
  }
});

export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}

export function validateRuntimeEnv(): void {
  if (validated) return;
  validated = true;

  const result = privateEnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .filter((i) => i.message.includes("Required"))
      .map((i) => i.path.join("."));
    if (missing.length > 0) {
      throw new Error(
        `Missing required runtime environment variables:\n  ${missing.join("\n  ")}\n\n` +
          "Check .env.example for the complete list."
      );
    }
    console.error("Invalid runtime environment variables:", JSON.stringify(result.error.issues, null, 2));
    throw new Error("Invalid runtime environment configuration");
  }
}
