import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageTransition } from "@/components/ui/page-transition";
import { PartnerLogoUpload } from "@/components/features/partner-logo-upload";
import { getPublicPartnerDetails } from "@/features/partners/services/partners-service";
import { db } from "@/lib/db";

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

  // Verifica se o usuário atual pode editar (owner ou admin)
  const session = await auth();
  const partnerRecord = session?.user
    ? await db.partner.findFirst({
        where: { slug, tenantId: session.user.tenantId, deletedAt: null },
        select: { ownerUserId: true },
      })
    : null;

  const canEdit =
    partnerRecord &&
    (partnerRecord.ownerUserId === session?.user?.id ||
      session?.user?.role === "ADMIN");

  return (
    <AppShell>
      <PageTransition>
        <div className="app-shell py-8">
          <Card variant="elevated" className="p-8">
            {/* Header com logo + info */}
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* Logo com upload (se tiver permissão) */}
              {canEdit ? (
                <PartnerLogoUpload
                  partnerSlug={slug}
                  partnerName={partner.name}
                  currentSignedUrl={partner.logoUrl}
                />
              ) : partner.logoUrl ? (
                <div className="flex-shrink-0">
                  <div className="h-20 w-20 overflow-hidden rounded-full">
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}

              {/* Info do parceiro */}
              <div className="flex-1 text-center md:text-left">
                <Badge variant="secondary">{partner.category}</Badge>
                <h1 className="mt-4 text-4xl font-black">{partner.name}</h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                  {partner.description}
                </p>
                <Badge variant="outline" className="mt-4">
                  {partner.coupon}
                </Badge>
              </div>
            </div>

            {/* Detalhes */}
            <div className="mt-8 grid gap-3 text-sm text-muted md:grid-cols-2">
              <p>📍 {partner.address}</p>
              <p>
                📱{" "}
                <a
                  href={`https://wa.me/${partner.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  {partner.whatsapp}
                </a>
              </p>
              {partner.instagram && (
                <p>
                  📸{" "}
                  <a
                    href={`https://instagram.com/${partner.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline"
                  >
                    {partner.instagram}
                  </a>
                </p>
              )}
              <p>📍 São Lourenço da Mata</p>
            </div>
          </Card>
        </div>
      </PageTransition>
    </AppShell>
  );
}
