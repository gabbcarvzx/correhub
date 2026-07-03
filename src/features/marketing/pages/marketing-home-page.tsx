import Link from "next/link";
import { ArrowRight, CalendarRange, Medal, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { heroStats, testimonials } from "@/features/marketing/data/marketing-data";

const pillars = [
  {
    title: "Para corredores",
    description: "Encontre treinos, acompanhe sua evolucao e participe de uma comunidade ativa."
  },
  {
    title: "Para lideres",
    description: "Gerencie grupos, agenda, check-ins, ranking e comunicados em um painel unico."
  },
  {
    title: "Para parceiros",
    description: "Ganhe visibilidade local com pagina propria, cupons e presenca na rota dos corredores."
  }
];

export function MarketingHomePage() {
  return (
    <AppShell>
      <main className="pb-20 pt-6">
        <div className="app-shell section-grid">
          <section className="hero-grid items-stretch py-10">
            <Card className="rounded-[var(--radius-lg)] bg-[linear-gradient(145deg,#0f172a_0%,#111827_40%,#153223_100%)] p-8 text-white md:p-12">
              <Badge className="bg-white/10 text-white">Tenant piloto: Sao Lourenco da Mata</Badge>
              <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight md:text-6xl">
                Todos os grupos de corrida da sua cidade em um so lugar.
              </h1>
              <p className="mt-5 max-w-2xl text-base text-slate-200 md:text-lg">
                Descubra treinos, participe de grupos, confirme presenca, faca check-in e acompanhe sua evolucao em uma experiencia premium, rapida e mobile-first.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="min-w-[180px]">
                  <Link href="/agenda">
                    Explorar treinos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild className="min-w-[180px] bg-white text-[var(--foreground)] hover:bg-slate-100" variant="secondary">
                  <Link href="/cadastro">Cadastrar meu grupo</Link>
                </Button>
              </div>
            </Card>
            <div className="section-grid">
              {heroStats.map((stat) => (
                <Card key={stat.label} className="rounded-[var(--radius-md)] p-6">
                  <p className="text-3xl font-black">{stat.value}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{stat.label}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Users, title: "Comunidade viva", text: "Grupos ativos, feed local e parceiros reais da cidade." },
              { icon: CalendarRange, title: "Agenda centralizada", text: "Treinos, longoes e corridas oficiais com filtros inteligentes." },
              { icon: Medal, title: "Evolucao visivel", text: "Ranking, conquistas, km do mes e historico de check-ins." }
            ].map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary-strong)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar) => (
              <Card key={pillar.title}>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary-strong)]">{pillar.title}</p>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">{pillar.description}</p>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name}>
                <p className="text-base leading-7 text-[var(--foreground)]">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold">{item.name}</p>
                <p className="text-sm text-[var(--muted)]">{item.role}</p>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 rounded-[var(--radius-lg)] bg-[linear-gradient(135deg,rgba(34,197,94,0.18),rgba(255,255,255,0.9))] p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-3xl font-black tracking-tight">Pronto para transformar a corrida da sua cidade em comunidade.</p>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                CorreHub nasce em Sao Lourenco da Mata, mas ja foi desenhado para conectar cidades inteiras, lideres locais e parceiros em escala nacional.
              </p>
            </div>
            <Button asChild className="min-w-[180px]">
              <Link href="/cadastro">Criar conta</Link>
            </Button>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
