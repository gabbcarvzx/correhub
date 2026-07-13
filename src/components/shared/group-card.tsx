import Link from "next/link"
import { MapPin, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MotionDiv } from "@/components/ui/motion-wrapper"

interface GroupCardProps {
  group: {
    slug: string
    name: string
    description: string
    leader: string
    meetingPoint: string
    members: number
    status: string
    logoUrl?: string | null
  }
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <MotionDiv whileHover={{ y: -4 }} className="h-full">
      <Card className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {group.logoUrl ? (
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={group.logoUrl}
                  alt={group.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold text-brand-600">
                {group.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold">{group.name}</h3>
              <p className="text-xs text-muted">{group.status}</p>
            </div>
          </div>
          <Badge variant="outline" size="sm">{group.status}</Badge>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-fg-secondary">
          <p>Líder: {group.leader}</p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {group.meetingPoint}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {group.members} membros
          </p>
        </div>
        <div className="mt-auto flex gap-3 pt-5">
          <Button asChild className="flex-1">
            <Link href={`/grupos/${group.slug}`}>Ver grupo</Link>
          </Button>
          <Button className="flex-1" variant="secondary">
            Participar
          </Button>
        </div>
      </Card>
    </MotionDiv>
  )
}
