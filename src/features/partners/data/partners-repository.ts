import { db } from "@/lib/db";

export async function findApprovedPartnersByTenant(tenantId: string) {
  return db.partner.findMany({
    where: {
      tenantId,
      status: "APPROVED",
      deletedAt: null
    },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }]
  });
}

export async function findApprovedPartnerBySlug(tenantId: string, slug: string) {
  return db.partner.findFirst({
    where: {
      tenantId,
      slug,
      status: "APPROVED",
      deletedAt: null
    }
  });
}

export async function findPendingPartners(tenantId: string) {
  return db.partner.findMany({
    where: {
      tenantId,
      status: "PENDING",
      deletedAt: null
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}

export async function updatePartnerModeration(input: {
  partnerId: string;
  tenantId: string;
  status: "APPROVED" | "REJECTED";
  reviewNotes?: string;
  reviewedById: string;
}) {
  const partner = await db.partner.findFirst({
    where: {
      id: input.partnerId,
      tenantId: input.tenantId,
      deletedAt: null
    }
  });

  if (!partner) {
    throw new Error("Partner not found.");
  }

  return db.partner.update({
    where: {
      id: partner.id
    },
    data: {
      status: input.status,
      reviewNotes: input.reviewNotes,
      reviewedById: input.reviewedById,
      reviewedAt: new Date()
    }
  });
}
