import { Store, Star, Award, Shield, TrendingUp, Users, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PartnerCard } from "@/components/shared/partner-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { MotionDiv, staggerContainer, staggerItem } from "@/components/ui/motion-wrapper";
import { listPublicPartners } from "@/features/partners/services/partners-service";

const PARTNER_WHATSAPP = "5581992796870";
const PARTNER_MESSAGE = encodeURIComponent("Olá, quero me tornar parceiro oficial do CorreHub.");

const benefits = [
  { icon: Star, title: "Destaque na plataforma", text: "Sua empresa aparece como parceira oficial na rota dos corredores." },
  { icon: TrendingUp, title: "Visibilidade semanal", text: "Seu negócio é visto por centenas de corredores ativos da cidade." },
  { icon: Users, title: "Conexão com a comunidade", text: "Acesso direto a grupos de corrida, líderes e eventos locais." },
  { icon: Zap, title: "Cupons exclusivos", text: "Ofereça descontos e atraia clientes que já praticam esportes." },
];

export default async function PartnersPage() {
  const partners = await listPublicPartners();

  const featuredPartners = partners.filter((p) => p.featured);
  const regularPartners = partners.filter((p) => !p.featured);

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          {/* Hero section */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-600 p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative">
              <Badge variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 mb-4">
                <Award className="mr-1 h-3 w-3" />
                Parceiros oficiais
              </Badge>
              <h1 className="text-4xl font-black text-white md:text-5xl">
                Quem fortalece a comunidade
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">
                Academias, lojas, nutricionistas e especialistas aprovados 
                que fazem parte da rede de apoio dos corredores de São Lourenço da Mata.
              </p>
            </div>
          </section>

          {/* Featured partners */}
          {featuredPartners.length > 0 && (
            <section className="mt-12">
              <div className="mb-6 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" />
                <h2 className="text-xl font-bold">Parceiros em destaque</h2>
              </div>
              <MotionDiv variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {featuredPartners.map((partner) => (
                  <MotionDiv key={partner.slug} variants={staggerItem}>
                    <PartnerCard partner={partner} />
                  </MotionDiv>
                ))}
              </MotionDiv>
            </section>
          )}

          {/* All partners */}
          <section className="mt-12">
            <SectionHeading
              eyebrow="Rede de apoio"
              title="Parceiros locais"
              description="Negócios que fortalecem a comunidade de corrida da cidade."
            />
            {regularPartners.length === 0 && featuredPartners.length === 0 ? (
              <EmptyState
                icon={Store}
                title="Nenhum parceiro cadastrado"
                description="Ainda não há parceiros na sua cidade. Seja o primeiro a apoiar a comunidade!"
              />
            ) : (
              <MotionDiv variants={staggerContainer} initial="hidden" animate="visible" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {regularPartners.map((partner) => (
                  <MotionDiv key={partner.slug} variants={staggerItem}>
                    <PartnerCard partner={partner} />
                  </MotionDiv>
                ))}
              </MotionDiv>
            )}
          </section>

          {/* Benefits section */}
          <section className="mt-16">
            <div className="mb-8 text-center">
              <Badge variant="secondary" size="sm" className="mb-3">
                <Shield className="mr-1 h-3 w-3" />
                Seja parceiro
              </Badge>
              <h2 className="text-3xl font-black tracking-tight md:text-4xl">
                Sua marca na rota dos corredores
              </h2>
              <p className="mt-3 text-sm text-muted max-w-xl mx-auto">
                Conecte seu negócio à comunidade de corrida mais ativa da cidade.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, text }) => (
                <Card key={title} variant="interactive" className="p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* WhatsApp CTA */}
          <section className="mt-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-8 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_50%)]" />
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <Badge variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 mb-3">
                  <Zap className="mr-1 h-3 w-3" />
                  Parceria estratégica
                </Badge>
                <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                  Seja um parceiro oficial do CorreHub
                </h2>
                <p className="mt-4 text-base leading-7 text-white/80">
                  Sua academia, loja ou consultório pode ser o point oficial dos corredores 
                  de São Lourenço da Mata. Visibilidade semanal, cupons exclusivos e 
                  conexão direta com a comunidade.
                </p>
                <ul className="mt-6 grid gap-2 text-sm text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    Página exclusiva com logo, fotos e descrição
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    Cupons de desconto para corredores
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    Destaque em eventos e ranking municipal
                  </li>
                </ul>
              </div>
              <a
                href={`https://wa.me/${PARTNER_WHATSAPP}?text=${PARTNER_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-lg transition-all duration-200 hover:bg-white/90 hover:shadow-xl active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Quero ser parceiro
                <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
