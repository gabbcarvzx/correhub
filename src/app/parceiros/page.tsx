import { AppShell } from "@/components/layout/app-shell";
import { PartnerCard } from "@/components/shared/partner-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { partners } from "@/features/demo/data/demo-data";

export default function PartnersPage() {
  return (
    <AppShell>
      <main className="app-shell py-8">
        <SectionHeading eyebrow="Parceiros" title="Negocios locais que fortalecem a comunidade" description="Academias, lojas, nutricionistas e especialistas aprovados para os corredores da cidade." />
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {partners.map((partner) => (
            <PartnerCard key={partner.slug} partner={partner} />
          ))}
        </section>
      </main>
    </AppShell>
  );
}
