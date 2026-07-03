import { AppShell } from "@/components/layout/app-shell";
import { GroupCard } from "@/components/shared/group-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { groups } from "@/features/demo/data/demo-data";

export default function GroupsPage() {
  return (
    <AppShell>
      <main className="app-shell py-8">
        <SectionHeading eyebrow="Grupos" title="Comunidades de corrida conectadas" description="Explore grupos por perfil, ritmo, local de encontro e dias de treino." />
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </section>
      </main>
    </AppShell>
  );
}
