import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { LoginForm } from "@/features/auth/components/login-form";
import { env } from "@/lib/env";

export default function LoginPage() {
  const googleEnabled = !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

  return (
    <AppShell footer={false}>
      <PageTransition>
        <div className="app-shell grid min-h-[calc(100vh-88px)] items-center py-10">
          <Card variant="elevated" className="mx-auto w-full max-w-md p-8">
            <Badge variant="secondary">Auth.js ready</Badge>
            <h1 className="mt-4 text-3xl font-black">Entrar no CorreHub</h1>
            <p className="mt-3 text-sm text-muted">Login local com email e senha. Google pode ser ativado via env.</p>
            <LoginForm googleEnabled={googleEnabled} />
            <p className="mt-6 text-sm text-muted">
              Ainda não tem conta?{" "}
              <Link className="font-semibold text-brand-600" href="/cadastro">
                Criar conta
              </Link>
            </p>
          </Card>
        </div>
      </PageTransition>
    </AppShell>
  );
}
