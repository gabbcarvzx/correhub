import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compareSync } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { env, isProduction } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email("Email invalido."),
  password: z.string().min(8, "Senha deve ter no minimo 8 caracteres.").max(128)
});

interface RateLimitEntry {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, RateLimitEntry>();

function getIsProduction(): boolean {
  try { return isProduction(); } catch { return false; }
}

const MAX_LOGIN_ATTEMPTS = getIsProduction() ? 5 : 20;
const LOCKOUT_DURATION_MS = getIsProduction() ? 15 * 60 * 1000 : 60 * 1000;
const WINDOW_MS = getIsProduction() ? 15 * 60 * 1000 : 60 * 1000;

function checkRateLimit(identifier: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  if (entry?.lockedUntil && entry.lockedUntil > now) {
    const remainingMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    throw new Error(`Conta temporariamente bloqueada. Tente novamente em ${remainingMinutes} minuto(s).`);
  }

  if (entry) {
    if (now - entry.firstAttemptAt > WINDOW_MS && entry.lockedUntil === null) {
      loginAttempts.set(identifier, { count: 1, firstAttemptAt: now, lockedUntil: null });
      return;
    }

    if (entry.count >= MAX_LOGIN_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_DURATION_MS;
      entry.count = 0;
      throw new Error(`Conta bloqueada por ${LOCKOUT_DURATION_MS / 60000} minutos devido a multiplas tentativas de login.`);
    }
  } else {
    loginAttempts.set(identifier, { count: 0, firstAttemptAt: now, lockedUntil: null });
  }
}

function recordAttempt(identifier: string, failed: boolean): void {
  const entry = loginAttempts.get(identifier);
  if (entry && failed) {
    entry.count = (entry.count ?? 0) + 1;
  }
}

function clearRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Senha", type: "password" }
    },
    async authorize(rawCredentials) {
      const parsed = credentialsSchema.safeParse(rawCredentials);

      if (!parsed.success) {
        return null;
      }

      const { email, password } = parsed.data;
      const identifier = `login:${email}`;

      try {
        checkRateLimit(identifier);
      } catch {
        return null;
      }

      const persistedUser = await db.user.findFirst({
        where: {
          email,
          deletedAt: null
        }
      }).catch(() => null);

      if (persistedUser?.passwordHash && compareSync(password, persistedUser.passwordHash)) {
        clearRateLimit(identifier);
        return {
          id: persistedUser.id,
          name: persistedUser.name,
          email: persistedUser.email,
          role: persistedUser.role,
          tenantId: persistedUser.tenantId
        };
      }

      recordAttempt(identifier, true);

      return null;
    }
  })
];

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.AUTH_SECRET || process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: isProduction() ? 24 * 60 * 60 : 7 * 24 * 60 * 60
  },
  providers,
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = typeof token.role === "string" ? token.role : "RUNNER";
        session.user.tenantId = typeof token.tenantId === "string" ? token.tenantId : "";
      }
      return session;
    }
  }
});
