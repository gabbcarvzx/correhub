import { Store } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PartnerCard } from "@/components/shared/partner-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { PageTransition } from "@/components/ui/page-transition";
import { listPublicPartners } from "@/features/partners/services/partners-service";

export default async function PartnersPage() {
  const partners = await listPublicPartners();

  return (
    <AppShell>
      <PageTransition>
        <main className="app-shell py-8">
          <SectionHeading eyebrow="Parceiros" title="Negocios locais que fortalecem a comunidade" description="Academias, lojas, nutricionistas e especialistas aprovados para os corredores da cidade." />
          {partners.length === 0 ? (
            <EmptyState
              icon={Store}
              title="Nenhum parceiro encontrado"
              description="Ainda não há parceiros cadastrados na sua cidade."
            />
          ) : (
            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {partners.map((partner) => (
                <PartnerCard key={partner.slug} partner={partner} />
              ))}
            </section>
          )}
        </main>
      </PageTransition>
    </AppShell>
  );
}
