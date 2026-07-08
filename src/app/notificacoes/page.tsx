import { Bell } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { requireUser } from "@/lib/auth/require-user";

const notifications = [
  "Seu próximo treino começa amanhã às 05:20.",
  "Seu grupo principal recebeu um novo parceiro local.",
  "Você desbloqueou a conquista 10 check-ins."
];

export default async function NotificationsPage() {
  await requireUser();

  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <h1 className="text-4xl font-black">Notificações</h1>
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nenhuma notificação"
              description="Você não tem notificações no momento."
            />
          ) : (
            <div className="mt-8 grid gap-4">
              {notifications.map((item) => (
                <Card key={item} variant="elevated">
                  <p className="text-sm leading-7 text-fg">{item}</p>
                </Card>
              ))}
            </div>
          )}
        </main>
      </PageTransition>
    </AppShell>
  );
}
