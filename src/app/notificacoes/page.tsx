import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/shared/card";
import { requireUser } from "@/lib/auth/require-user";

const notifications = [
  "Seu proximo treino comeca amanha as 05:20.",
  "Seu grupo principal recebeu um novo parceiro local.",
  "Voce desbloqueou a conquista 10 check-ins."
];

export default async function NotificationsPage() {
  await requireUser();

  return (
    <AppShell>
      <main className="app-shell py-8">
        <h1 className="text-4xl font-black">Notificacoes</h1>
        <div className="mt-8 grid gap-4">
          {notifications.map((item) => (
            <Card key={item}>
              <p className="text-sm leading-7 text-[var(--foreground)]">{item}</p>
            </Card>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
