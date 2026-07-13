import { MessageSquare } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { db } from "@/lib/db";
import { getCurrentTenant } from "@/lib/security/tenant";
import { requireUser } from "@/lib/auth/require-user";

export default async function CommunityPage() {
  await requireUser();
  const tenant = await getCurrentTenant();

  const posts = await db.communityPost.findMany({
    where: {
      tenantId: tenant.id,
      deletedAt: null,
    },
    include: {
      group: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          <SectionHeading
            eyebrow="Comunidade"
            title="Feed local dos grupos"
            description="Avisos, convites, mudanças de horário e comunicados dos líderes."
          />
          {posts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="Nenhuma publicação"
              description="Ainda não há publicações no feed da comunidade."
            />
          ) : (
            <section className="mt-8 grid gap-4">
              {posts.map((post) => (
                <Card key={post.id} variant="elevated" className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                    {post.group.name}
                  </p>
                  <h2 className="mt-3 text-xl font-bold">{post.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted">{post.content}</p>
                  <p className="mt-4 text-xs text-muted">
                    {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              ))}
            </section>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
