import Link from "next/link";
import { ArrowRight, CalendarRange, Medal, Users, MapPin, TrendingUp, Zap, Shield, UserPlus, CalendarCheck, Crown, Flame } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { heroStats, testimonials } from "@/features/marketing/data/marketing-data";
import { PageTransition } from "@/components/ui/page-transition";
import type { RunnerOfWeekResult } from "@/features/runner-of-week/services/runner-of-week-service";

const features = [
  { icon: Users, title: "Comunidade viva", text: "Grupos ativos, feed local e parceiros reais da cidade." },
  { icon: CalendarRange, title: "Agenda centralizada", text: "Treinos, longões e corridas oficiais com filtros inteligentes." },
  { icon: Medal, title: "Evolução visível", text: "Ranking, conquistas, km do mês e histórico de check-ins." }
];

const howItWorks = [
  { icon: UserPlus, title: "Crie sua conta", text: "Cadastre-se em segundos como corredor, líder ou parceiro local." },
  { icon: CalendarCheck, title: "Encontre treinos", text: "Descubra grupos, eventos e parceiros perto de você." },
  { icon: TrendingUp, title: "Evolua com dados", text: "Acompanhe presença, km rodados e ranking da cidade." }
];

const pillars = [
  {
    title: "Para corredores",
    description: "Encontre treinos, acompanhe sua evolução e participe de uma comunidade ativa.",
    icon: TrendingUp
  },
  {
    title: "Para líderes",
    description: "Gerencie grupos, agenda, check-ins, ranking e comunicados em um painel único.",
    icon: Zap
  },
  {
    title: "Para parceiros",
    description: "Ganhe visibilidade local com página própria, cupons e presença na rota dos corredores.",
    icon: Shield
  }
];

const faqItems = [
  {
    q: "Como faço para participar de um grupo?",
    a: "Basta criar sua conta e explorar os grupos disponíveis na sua cidade. Cada grupo tem página própria com agenda e contato do líder."
  },
  {
    q: "Preciso pagar para usar?",
    a: "Não, o CorreHub é gratuito para corredores. Líderes e parceiros têm planos premium com recursos exclusivos."
  },
  {
    q: "Como funciona o check-in?",
    a: "O líder gera um código QR válido durante a janela do evento. Você escaneia no local e sua presença é registrada automaticamente."
  },
  {
    q: "Posso criar meu próprio grupo?",
    a: "Sim! Qualquer corredor pode solicitar a criação de um grupo. Após aprovação, você vira líder e pode gerenciar agenda e membros."
  }
];

export function MarketingHomePage({
  runnerOfWeek,
}: {
  runnerOfWeek?: RunnerOfWeekResult | null;
}) {
  return (
    <AppShell>
      <PageTransition>
        <main className="pb-20 pt-6 md:pb-24">
          <div className="app-shell space-y-16 md:space-y-24">
            <section className="grid items-stretch gap-6 md:grid-cols-[1.3fr_0.7fr] md:py-10">
              <Card variant="elevated" className="relative overflow-hidden p-8 md:p-12">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-accent-500/10" />
                <div className="relative">
                  <Badge variant="secondary" size="sm">
                    <MapPin className="mr-1 h-3 w-3" />
                    Piloto: São Lourenço da Mata
                  </Badge>
                  <h1 className="mt-6 max-w-xl text-4xl font-black tracking-tight md:text-6xl">
                    Todos os grupos de corrida da sua cidade em um só lugar.
                  </h1>
                  <p className="mt-5 max-w-2xl text-base text-fg-secondary md:text-lg">
                    Descubra treinos, participe de grupos, confirme presença, faça check-in e acompanhe sua evolução em uma experiência premium, rápida e mobile-first.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Button asChild size="lg">
                      <Link href="/agenda">
                        Explorar treinos
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                      <Link href="/cadastro">Cadastrar meu grupo</Link>
                    </Button>
                  </div>
                </div>
              </Card>
              <div className="grid gap-4">
                {heroStats.map((stat) => (
                  <Card key={stat.label} variant="elevated" className="p-6">
                    <p className="text-3xl font-black text-brand-500">{stat.value}</p>
                    <p className="mt-2 text-sm text-muted">{stat.label}</p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Runner of the Week */}
            {runnerOfWeek && (
              <section>
                <div className="mb-8 text-center">
                  <Badge variant="default" size="sm" className="bg-amber-100 text-amber-800 border-amber-200">
                    <Crown className="mr-1 h-3 w-3" />
                    Destaque da Semana
                  </Badge>
                  <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                    Quem está puxando o pace
                  </h2>
                </div>
                <Card variant="elevated" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white shadow-lg md:p-12">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_50%)]" />
                  <div className="relative flex flex-col items-center gap-8 md:flex-row">
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/40 shadow-xl">
                        {runnerOfWeek.image ? (
                          <img
                            src={runnerOfWeek.image}
                            alt={runnerOfWeek.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-white/20 text-4xl font-bold text-white">
                            {runnerOfWeek.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="text-sm uppercase tracking-[0.2em] text-white/70">Atleta da semana</p>
                      <h3 className="mt-2 text-3xl font-black">{runnerOfWeek.name}</h3>
                      <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm md:justify-start">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="h-4 w-4" />
                          {runnerOfWeek.totalKm} km na semana
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Flame className="h-4 w-4" />
                          Streak: {runnerOfWeek.currentStreak} dias
                        </span>
                      </div>
                      <div className="mt-6">
                        <Button asChild variant="secondary" size="sm">
                          <Link href={`/atleta/${runnerOfWeek.name}`}>
                            Ver perfil
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            <section className="grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <Card key={title} variant="interactive" className="p-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 ring-1 ring-brand-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                </Card>
              ))}
            </section>

            <section>
              <div className="mb-10 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Simples</p>
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">Como funciona</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {howItWorks.map(({ icon: Icon, title, text }, i) => (
                  <Card key={title} variant="interactive" className="relative p-6 pt-12">
                    <div className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white shadow-glow">
                      {i + 1}
                    </div>
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 ring-1 ring-brand-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-10 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Para quem é</p>
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">Uma plataforma para todos</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {pillars.map(({ icon: Icon, title, description }) => (
                  <Card key={title} variant="interactive" className="p-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-brand-500">{title}</p>
                    <p className="mt-3 text-base leading-7 text-fg-secondary">{description}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-10 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">Depoimentos</p>
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">Quem usa recomenda</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {testimonials.map((item) => (
                  <Card key={item.name} variant="elevated" className="p-6">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="mt-4 text-base leading-7 text-fg">&ldquo;{item.quote}&rdquo;</p>
                    <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600">
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-sm text-muted">{item.role}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-10 text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-500">FAQ</p>
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">Perguntas frequentes</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {faqItems.map((item) => (
                  <Card key={item.q} variant="bordered" className="p-6">
                    <p className="font-semibold">{item.q}</p>
                    <p className="mt-2 text-sm text-muted">{item.a}</p>
                  </Card>
                ))}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 p-8 md:p-12">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
              <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <p className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    Pronto para transformar a corrida da sua cidade em comunidade.
                  </p>
                  <p className="mt-4 text-base leading-7 text-white/80">
                    CorreHub nasce em São Lourenço da Mata, mas já foi projetado para conectar cidades inteiras, líderes locais e parceiros em escala nacional.
                  </p>
                </div>
                <Button asChild size="xl" className=" shrink-0 bg-white text-brand-600 hover:bg-white/90 hover:text-brand-700">
                  <Link href="/cadastro">Criar conta grátis</Link>
                </Button>
              </div>
            </section>
          </div>
        </main>
      </PageTransition>
    </AppShell>
  );
}
