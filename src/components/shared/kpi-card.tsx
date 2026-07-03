import { Card } from "@/components/shared/card";

export function KpiCard({
  label,
  value
}: Readonly<{
  label: string;
  value: string | number;
}>) {
  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
    </Card>
  );
}
