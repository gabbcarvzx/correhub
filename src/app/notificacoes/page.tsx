import { Bell } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/require-user";
import { getCurrentTenant } from "@/lib/security/tenant";

export default async function NotificationsPage() {
  const user = await requireUser();
  const tenant = await getCurrentTenant();

  const notifications = await db.notification.findMany({
    where: {
      tenantId: tenant.id,
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          <h1 className="text-4xl font-black">Notificações</h1>
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nenhuma notificação"
              description="Você não tem notificações no momento."
            />
          ) : (
            <div className="mt-8 grid gap-4">
              {notifications.map((notification) => (
                <Card key={notification.id} variant="elevated" className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-fg">{notification.title}</p>
                      <p className="mt-1 text-sm leading-7 text-muted">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.readAt && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                    )}
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {new Date(notification.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
