import { MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { posts } from "@/features/demo/data/demo-data";

export default function CommunityPage() {
  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <SectionHeading eyebrow="Comunidade" title="Feed local dos grupos" description="Avisos, convites, mudanças de horário e comunicados dos líderes." />
          {posts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nenhuma publicação"
              description="Ainda não há publicações no feed da comunidade."
            />
          ) : (
            <section className="mt-8 grid gap-4">
              {posts.map((post) => (
                <Card key={post.id} variant="elevated">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{post.groupName}</p>
                  <h2 className="mt-3 text-xl font-bold">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{post.content}</p>
                </Card>
              ))}
            </section>
          )}
        </main>
      </PageTransition>
    </AppShell>
  );
}
