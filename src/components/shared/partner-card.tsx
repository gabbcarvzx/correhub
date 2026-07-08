import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MotionDiv } from "@/components/ui/motion-wrapper"

interface PartnerCardProps {
  partner: {
    slug: string
    name: string
    category: string
    description: string
    coupon: string
  }
}

export function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <MotionDiv whileHover={{ y: -4 }} className="h-full">
      <Card className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{partner.name}</h3>
            <p className="text-sm text-fg-secondary">{partner.category}</p>
          </div>
          <Badge variant="success" size="sm">{partner.coupon}</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-fg-secondary">{partner.description}</p>
        <div className="mt-auto pt-5">
          <Button asChild className="w-full">
            <Link href={`/parceiros/${partner.slug}`}>Ver parceiro</Link>
          </Button>
        </div>
      </Card>
    </MotionDiv>
  )
}
