import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compareSync } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/features/observability/logger";
import { sanitizeRole, sanitizeTenantId } from "@/lib/auth/helpers";
import { checkRateLimit, clearRateLimit } from "@/lib/security/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres.").max(128),
});

// ---------------------------------------------------------------------------
// Rate limiting — login via Redis distribuído
// Antes: Map em memória. Agora: Upstash Redis com sliding window.
// ---------------------------------------------------------------------------

const isProductionEnv = env.NODE_ENV === "production";

async function checkLoginRateLimit(identifier: string): Promise<void> {
  const result = await checkRateLimit({
    identifier,
    config: {
      windowMs: isProductionEnv ? 15 * 60 * 1000 : 60 * 1000,   // 15min prod, 1min dev
      maxRequests: isProductionEnv ? 5 : 20,
    },
    scope: "ip",
    storeName: "login",
  });

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil(result.resetInMs / 1000);
    throw new Error(
      `Conta temporariamente bloqueada. Tente novamente em ${Math.ceil(retryAfterSeconds / 60)} minuto(s).`
    );
  }
}

async function clearLoginRateLimit(identifier: string): Promise<void> {
  await clearRateLimit({ identifier, storeName: "login" });
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------
const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) {
        logger.warn("auth.credentials.invalid", {
          error: parsed.error.flatten().fieldErrors,
        });
        return null;
      }

      const { email, password } = parsed.data;
      const identifier = `login:${email.toLowerCase().trim()}`;

      try {
        await checkLoginRateLimit(identifier);
      } catch {
        logger.warn("auth.rate_limit.exceeded", { identifier: email });
        return null;
      }

      const persistedUser = await db.user
        .findFirst({
          where: {
            email: email.toLowerCase().trim(),
            deletedAt: null,
          },
        })
        .catch((error) => {
          logger.error("auth.user_lookup_failed", {
            error: String(error),
            email,
          });
          return null;
        });

      if (persistedUser?.passwordHash && compareSync(password, persistedUser.passwordHash)) {
        await clearLoginRateLimit(identifier);
        logger.info("auth.login.success", { userId: persistedUser.id, role: persistedUser.role });

        return {
          id: persistedUser.id,
          name: persistedUser.name,
          email: persistedUser.email,
          role: persistedUser.role,
          tenantId: persistedUser.tenantId,
        };
      }

      // Login falhou — o rate limit já foi incrementado pelo sliding window
      logger.warn("auth.login.failed", { email });

      return null;
    },
  }),
];

// Adiciona Google provider apenas se configurado
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    })
  );
}

/**
 * Retorna o AUTH_SECRET de forma segura.
 * NUNCA retorna um fallback hardcoded — em produção, lança erro se não estiver definido.
 */
function getAuthSecret(): string {
  const secret = env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET is required in production and must be at least 32 characters long."
      );
    }
    // Em dev, retorna um fallback SEGURO apenas para desenvolvimento local
    return "dev-secret-at-least-32-characters-long!!";
  }
  return secret;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: getAuthSecret(),
  session: {
    strategy: "jwt",
    maxAge: env.NODE_ENV === "production" ? 24 * 60 * 60 : 7 * 24 * 60 * 60, // 24h prod, 7d dev
  },
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Valida e sanitiza os claims que vêm do banco
        token.role = sanitizeRole(user.role);
        token.tenantId = sanitizeTenantId(user.tenantId);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        // Sempre sanitiza as claims do token (proteção contra tokens forjados/inválidos)
        session.user.role = sanitizeRole(token.role);
        session.user.tenantId = sanitizeTenantId(token.tenantId);
      }
      return session;
    },
  },
});
