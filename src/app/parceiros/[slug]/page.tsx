import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { getPublicPartnerDetails } from "@/features/partners/services/partners-service";

export default async function PartnerDetailsPage({
  params
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const partner = await getPublicPartnerDetails(slug);

  if (!partner) {
    notFound();
  }

  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <Card variant="elevated" className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Badge variant="secondary">{partner.category}</Badge>
                <h1 className="mt-4 text-4xl font-black">{partner.name}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">{partner.description}</p>
              </div>
              <Badge variant="outline">{partner.coupon}</Badge>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-muted md:grid-cols-2">
              <p>Endereço: {partner.address}</p>
              <p>WhatsApp: {partner.whatsapp}</p>
              <p>Instagram: {partner.instagram}</p>
              <p>Localização: São Lourenço da Mata</p>
            </div>
          </Card>
        </main>
      </PageTransition>
    </AppShell>
  );
}
