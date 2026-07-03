import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <AppShell footer={false}>
      <main className="app-shell grid min-h-[calc(100vh-88px)] items-center py-10">
        <Card className="mx-auto w-full max-w-md rounded-[var(--radius-lg)] p-8">
          <Badge>Auth.js ready</Badge>
          <h1 className="mt-4 text-3xl font-black">Entrar no CorreHub</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">Login local com email e senha. Google pode ser ativado via env.</p>
          <LoginForm />
          <p className="mt-6 text-sm text-[var(--muted)]">
            Ainda nao tem conta?{" "}
            <Link className="font-semibold text-[var(--primary-strong)]" href="/cadastro">
              Criar conta
            </Link>
          </p>
        </Card>
      </main>
    </AppShell>
  );
}
