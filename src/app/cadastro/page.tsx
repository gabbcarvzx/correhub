import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";

export default function RegisterPage() {
  return (
    <AppShell footer={false}>
      <main className="app-shell grid min-h-[calc(100vh-88px)] items-center py-10">
        <Card className="mx-auto w-full max-w-2xl rounded-[var(--radius-lg)] p-8">
          <h1 className="text-3xl font-black">Criar conta</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">Cadastre-se como corredor e evolua depois para lider ou parceiro.</p>
          <form className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Nome
              <input className="h-12 rounded-2xl border-0 bg-white px-4 ring-1 ring-[var(--border)]" placeholder="Seu nome" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Cidade
              <input className="h-12 rounded-2xl border-0 bg-white px-4 ring-1 ring-[var(--border)]" defaultValue="Sao Lourenco da Mata" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <input className="h-12 rounded-2xl border-0 bg-white px-4 ring-1 ring-[var(--border)]" placeholder="voce@exemplo.com" type="email" />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Senha
              <input className="h-12 rounded-2xl border-0 bg-white px-4 ring-1 ring-[var(--border)]" placeholder="Minimo 8 caracteres" type="password" />
            </label>
            <label className="grid gap-2 text-sm font-medium md:col-span-2">
              Distancia preferida
              <select className="h-12 rounded-2xl border-0 bg-white px-4 ring-1 ring-[var(--border)]">
                <option>5 km</option>
                <option>10 km</option>
                <option>15 km</option>
                <option>21 km</option>
                <option>Livre</option>
              </select>
            </label>
            <div className="md:col-span-2">
              <Button className="w-full" type="submit">
                Criar conta
              </Button>
            </div>
          </form>
          <p className="mt-6 text-sm text-[var(--muted)]">
            Ja possui conta?{" "}
            <Link className="font-semibold text-[var(--primary-strong)]" href="/login">
              Entrar
            </Link>
          </p>
        </Card>
      </main>
    </AppShell>
  );
}
