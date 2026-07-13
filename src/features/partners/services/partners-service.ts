import { findApprovedPartnerBySlug, findApprovedPartnersByTenant, findPendingPartners, updatePartnerModeration } from "@/features/partners/data/partners-repository";
import type { PartnerCardModel } from "@/features/shared/types";
import { getCachedSignedUrl } from "@/features/uploads/signed-url-cache";
import { getCurrentTenant, getAuthenticatedTenant } from "@/lib/security/tenant";
import { createAuditLog } from "@/features/admin/data/audit-log-repository";
import { logger, getLogger } from "@/features/observability/logger";

export async function listPublicPartners(): Promise<PartnerCardModel[]> {
  const tenant = await getCurrentTenant();
  const log = getLogger({ tenantId: tenant.id });

  const records = await findApprovedPartnersByTenant(tenant.id);

  if (records.length === 0) {
    log.info("partners.list.empty");
    return [];
  }

  // Converte storage keys para signed URLs (com cache)
  const signedUrls = await Promise.all(
    records.map(async (partner) => ({
      slug: partner.slug,
      signedLogoUrl: partner.logoUrl ? await getCachedSignedUrl(partner.logoUrl) : null,
    }))
  );
  const signedUrlMap = new Map(signedUrls.map((s) => [s.slug, s.signedLogoUrl]));

  return records.map((partner) => ({
    slug: partner.slug,
    name: partner.name,
    category: partner.category,
    description: partner.description,
    coupon: partner.couponCode ?? "Sem cupom",
    whatsapp: partner.whatsapp,
    instagram: partner.instagram ?? "",
    address: partner.address,
    featured: partner.featured,
    logoUrl: signedUrlMap.get(partner.slug) ?? null,
    gallery: partner.gallery,
  }));
}

export async function getPublicPartnerDetails(slug: string) {
  const tenant = await getCurrentTenant();
  const log = getLogger({ tenantId: tenant.id, slug });

  const partner = await findApprovedPartnerBySlug(tenant.id, slug);

  if (!partner) {
    log.info("partners.details.not_found", { slug });
    return null;
  }

  const logoUrl = partner.logoUrl ? await getCachedSignedUrl(partner.logoUrl) : null;

  return {
    slug: partner.slug,
    name: partner.name,
    category: partner.category,
    description: partner.description,
    coupon: partner.couponCode ?? "Sem cupom",
    whatsapp: partner.whatsapp,
    instagram: partner.instagram ?? "",
    address: partner.address,
    logoUrl,
    gallery: partner.gallery,
  };
}

export async function listPendingPartnersForAdmin() {
  const tenant = await getAuthenticatedTenant();
  return findPendingPartners(tenant.id);
}

export async function moderatePartner(input: {
  actorUserId: string;
  partnerId: string;
  status: "APPROVED" | "REJECTED";
  reviewNotes?: string;
}) {
  const tenant = await getAuthenticatedTenant();
  const partner = await updatePartnerModeration({
    partnerId: input.partnerId,
    tenantId: tenant.id,
    status: input.status,
    reviewNotes: input.reviewNotes,
    reviewedById: input.actorUserId,
  });

  await createAuditLog({
    tenantId: tenant.id,
    actorUserId: input.actorUserId,
    entityType: "PARTNER",
    entityId: input.partnerId,
    action: input.status,
    metadata: {
      reviewNotes: input.reviewNotes ?? null,
    },
  });

  return partner;
}
