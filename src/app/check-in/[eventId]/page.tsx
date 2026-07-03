import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";
import { events } from "@/features/demo/data/demo-data";
import { requireUser } from "@/lib/auth/require-user";

export default async function CheckInPage({
  params
}: Readonly<{
  params: Promise<{ eventId: string }>;
}>) {
  await requireUser();

  const { eventId } = await params;
  const event = events.find((entry) => entry.id === eventId) ?? events[0];

  return (
    <AppShell footer={false}>
      <main className="app-shell grid min-h-[calc(100vh-88px)] items-center py-10">
        <Card className="mx-auto w-full max-w-lg rounded-[var(--radius-lg)] p-8">
          <Badge>Check-in seguro</Badge>
          <h1 className="mt-4 text-3xl font-black">{event.title}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">Valide sua presenca com autenticacao, janela ativa e vinculacao ao tenant.</p>
          <div className="mt-6 rounded-[var(--radius-md)] bg-white p-4 ring-1 ring-[var(--border)]">
            <p className="text-sm text-[var(--muted)]">Evento</p>
            <p className="mt-2 font-semibold">{event.groupName}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{event.location}</p>
          </div>
          <Button className="mt-6 w-full">Registrar presenca</Button>
        </Card>
      </main>
    </AppShell>
  );
}
