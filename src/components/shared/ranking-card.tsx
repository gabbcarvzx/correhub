import { Card } from "@/components/shared/card";

interface RankingCardProps {
  entry: {
    position: number;
    name: string;
    group: string;
    attendances: number;
    km: number;
  };
}

export function RankingCard({ entry }: RankingCardProps) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-strong)]">#{entry.position}</p>
        <p className="mt-2 text-lg font-bold">{entry.name}</p>
        <p className="text-sm text-[var(--muted)]">{entry.group}</p>
      </div>
      <div className="text-right text-sm text-[var(--muted)]">
        <p>{entry.attendances} presencas</p>
        <p>{entry.km} km</p>
      </div>
    </Card>
  );
}
