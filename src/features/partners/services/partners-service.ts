import { partners as demoPartners } from "@/features/demo/data/demo-data";
import { findApprovedPartnerBySlug, findApprovedPartnersByTenant, findPendingPartners, updatePartnerModeration } from "@/features/partners/data/partners-repository";
import type { PartnerCardModel } from "@/features/shared/types";
import { withFallback } from "@/features/shared/services/fallback";
import { getCurrentTenant, getAuthenticatedTenant } from "@/lib/security/tenant";
import { createAuditLog } from "@/features/admin/data/audit-log-repository";

export async function listPublicPartners(): Promise<PartnerCardModel[]> {
  const tenant = await getCurrentTenant();
  return withFallback({
    query: async () => {
      const records = await findApprovedPartnersByTenant(tenant.id);
      return records.map((partner) => ({
        slug: partner.slug,
        name: partner.name,
        category: partner.category,
        description: partner.description,
        coupon: partner.couponCode ?? "Sem cupom",
        whatsapp: partner.whatsapp,
        instagram: partner.instagram ?? "",
        address: partner.address
      }));
    },
    fallback: () => demoPartners,
    isEmpty: (value) => value.length === 0
  });
}

export async function getPublicPartnerDetails(slug: string) {
  const tenant = await getCurrentTenant();
  return withFallback({
    query: async () => {
      const partner = await findApprovedPartnerBySlug(tenant.id, slug);
      if (!partner) {
        return null;
      }

      return {
        slug: partner.slug,
        name: partner.name,
        category: partner.category,
        description: partner.description,
        coupon: partner.couponCode ?? "Sem cupom",
        whatsapp: partner.whatsapp,
        instagram: partner.instagram ?? "",
        address: partner.address,
        gallery: partner.gallery
      };
    },
    fallback: () => {
      const partner = demoPartners.find((entry) => entry.slug === slug);

      if (!partner) {
        return null;
      }

      return {
        slug: partner.slug,
        name: partner.name,
        category: partner.category,
        description: partner.description,
        coupon: partner.coupon,
        whatsapp: partner.whatsapp,
        instagram: partner.instagram,
        address: partner.address,
        gallery: []
      };
    }
  });
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
    reviewedById: input.actorUserId
  });

  await createAuditLog({
    tenantId: tenant.id,
    actorUserId: input.actorUserId,
    entityType: "PARTNER",
    entityId: input.partnerId,
    action: input.status,
    metadata: {
      reviewNotes: input.reviewNotes ?? null
    }
  });

  return partner;
}
