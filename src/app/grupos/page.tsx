import { Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { GroupCard } from "@/components/shared/group-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { listPublicGroups } from "@/features/groups/services/groups-service";

export default async function GroupsPage() {
  const groups = await listPublicGroups();

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          <SectionHeading eyebrow="Grupos" title="Comunidades de corrida conectadas" description="Explore grupos por perfil, ritmo, local de encontro e dias de treino." />
          {groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum grupo encontrado"
              description="Ainda não há grupos públicos cadastrados na sua cidade."
            />
          ) : (
            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </section>
          )}
      </div>
    </PageTransition>
    </AppShell>
  );
}
