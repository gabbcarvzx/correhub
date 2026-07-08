import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { CheckInButton } from "@/features/check-in/components/check-in-button";
import { findEventById } from "@/features/events/data/events-repository";
import { getCurrentTenant } from "@/lib/security/tenant";
import { requireUser } from "@/lib/auth/require-user";

export default async function CheckInPage({
  params
}: Readonly<{
  params: Promise<{ eventId: string }>;
}>) {
  await requireUser();

  const { eventId } = await params;
  const tenant = await getCurrentTenant();
  const event = await findEventById(tenant.id, eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  return (
    <AppShell footer={false}>
      <PageTransition>
        <main className="app-shell grid min-h-[calc(100vh-88px)] items-center py-10">
          <Card variant="elevated" className="mx-auto w-full max-w-lg p-8">
            <Badge variant="secondary">Check-in seguro</Badge>
            <h1 className="mt-4 text-3xl font-black">{event.title}</h1>
            <p className="mt-3 text-sm text-muted">Valide sua presença com autenticação, janela ativa e vinculação ao tenant.</p>
            <div className="mt-6 rounded-xl bg-surface-solid p-4 border border-border">
              <p className="text-sm text-muted">Evento</p>
              <p className="mt-2 font-semibold">{event.group.name}</p>
              <p className="mt-1 text-sm text-muted">{event.location}</p>
            </div>
            <CheckInButton runEventId={event.id} />
          </Card>
        </main>
      </PageTransition>
    </AppShell>
  );
}
