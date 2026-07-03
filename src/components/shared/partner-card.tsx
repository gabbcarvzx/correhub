import Link from "next/link";
import { Badge } from "@/components/shared/badge";
import { Button } from "@/components/shared/button";
import { Card } from "@/components/shared/card";

interface PartnerCardProps {
  partner: {
    slug: string;
    name: string;
    category: string;
    description: string;
    coupon: string;
  };
}

export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{partner.name}</h3>
          <p className="text-sm text-[var(--muted)]">{partner.category}</p>
        </div>
        <Badge>{partner.coupon}</Badge>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{partner.description}</p>
      <div className="mt-5">
        <Button asChild className="w-full">
          <Link href={`/parceiros/${partner.slug}`}>Ver parceiro</Link>
        </Button>
      </div>
    </Card>
  );
}
