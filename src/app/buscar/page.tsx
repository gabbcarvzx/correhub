import { Search } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/shared/card";
import { groups, events, partners } from "@/features/demo/data/demo-data";

export default function SearchPage() {
  return (
    <AppShell>
      <main className="app-shell py-8">
        <Card className="rounded-[var(--radius-lg)] p-6">
          <div className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-white px-4 py-4 ring-1 ring-[var(--border)]">
            <Search className="h-5 w-5 text-[var(--muted)]" />
            <input className="w-full border-0 bg-transparent outline-none" placeholder="Buscar grupo, corredor, evento ou parceiro" />
          </div>
        </Card>
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <h2 className="text-lg font-bold">Grupos</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {groups.map((group) => (
                <li key={group.id}>{group.name}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Eventos</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {events.map((event) => (
                <li key={event.id}>{event.title}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-lg font-bold">Parceiros</h2>
            <ul className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
              {partners.map((partner) => (
                <li key={partner.slug}>{partner.name}</li>
              ))}
            </ul>
          </Card>
        </section>
      </main>
    </AppShell>
  );
}
