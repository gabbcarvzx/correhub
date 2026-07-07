import { AppShell } from "@/components/layout/app-shell";
import { RankingCard } from "@/components/shared/ranking-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { listCityRanking } from "@/features/rankings/services/rankings-service";

export default async function RankingPage() {
  const ranking = await listCityRanking();

  return (
    <AppShell>
      <main className="app-shell py-8">
        <SectionHeading eyebrow="Ranking" title="Quem esta puxando o pace da cidade" description="Ranking geral com base em check-ins validados e quilometragem informada." />
        <section className="mt-8 grid gap-4">
          {ranking.map((entry) => (
            <RankingCard key={entry.position} entry={entry} />
          ))}
        </section>
      </main>
    </AppShell>
  );
}
