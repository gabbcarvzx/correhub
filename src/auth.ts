import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compareSync, hashSync } from "bcryptjs";
import { z } from "zod";
import { env } from "@/lib/env";

const demoUsers = [
  {
    id: "demo-runner",
    name: "Mariana Alves",
    email: "runner@correhub.local",
    passwordHash: hashSync("runner123", 10),
    role: "RUNNER"
  },
  {
    id: "demo-admin",
    name: "Admin CorreHub",
    email: "admin@correhub.local",
    passwordHash: hashSync("admin123", 10),
    role: "ADMIN"
  },
  {
    id: "demo-leader",
    name: "Carlos Teles",
    email: "lider@correhub.local",
    passwordHash: hashSync("lider123", 10),
    role: "GROUP_LEADER"
  }
];

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

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

      const user = demoUsers.find((entry) => entry.email === parsed.data.email);

      if (!user) {
        return null;
      }

      if (!compareSync(parsed.data.password, user.passwordHash)) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
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
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  providers,
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = typeof token.role === "string" ? token.role : "RUNNER";
      }
      return session;
    }
  }
});
