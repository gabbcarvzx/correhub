import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/shared/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { posts } from "@/features/demo/data/demo-data";

export default function CommunityPage() {
  return (
    <AppShell>
      <main className="app-shell py-8">
        <SectionHeading eyebrow="Comunidade" title="Feed local dos grupos" description="Avisos, convites, mudancas de horario e comunicados dos lideres." />
        <section className="mt-8 grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-strong)]">{post.groupName}</p>
              <h2 className="mt-3 text-xl font-bold">{post.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{post.content}</p>
            </Card>
          ))}
        </section>
      </main>
    </AppShell>
  );
}
