import { Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { RankingCard } from "@/components/shared/ranking-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { listCityRanking } from "@/features/rankings/services/rankings-service";

export default async function RankingPage() {
  const ranking = await listCityRanking();

  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <SectionHeading eyebrow="Ranking" title="Quem está puxando o pace da cidade" description="Ranking geral com base em check-ins validados e quilometragem informada." />
          {ranking.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Nenhum ranking disponível"
              description="Ainda não há dados de ranking. Participe de eventos e faça check-in para aparecer aqui."
            />
          ) : (
            <section className="mt-8 grid gap-4">
              {ranking.map((entry) => (
                <RankingCard key={entry.position} entry={entry} />
              ))}
            </section>
          )}
        </main>
      </PageTransition>
    </AppShell>
  );
}
