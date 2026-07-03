import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/shared/badge";
import { Card } from "@/components/shared/card";
import { partners } from "@/features/demo/data/demo-data";

export default async function PartnerDetailsPage({
  params
}: Readonly<{
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const partner = partners.find((entry) => entry.slug === slug);

  if (!partner) {
    notFound();
  }

  return (
    <AppShell>
      <main className="app-shell py-8">
        <Card className="rounded-[var(--radius-lg)] p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge>{partner.category}</Badge>
              <h1 className="mt-4 text-4xl font-black">{partner.name}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">{partner.description}</p>
            </div>
            <Badge>{partner.coupon}</Badge>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-2">
            <p>Endereco: {partner.address}</p>
            <p>WhatsApp: {partner.whatsapp}</p>
            <p>Instagram: {partner.instagram}</p>
            <p>Localizacao: Sao Lourenco da Mata</p>
          </div>
        </Card>
      </main>
    </AppShell>
  );
}
