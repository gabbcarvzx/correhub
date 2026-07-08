import { CalendarDays, MapPin, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MotionDiv } from "@/components/ui/motion-wrapper"
import { formatDate, formatDistanceLabel } from "@/lib/utils"

interface EventCardProps {
  event: {
    id: string
    title: string
    groupName: string
    date: string
    location: string
    distance: string
    confirmedCount: number
  }
  action?: React.ReactNode
}

export function EventCard({ event, action }: EventCardProps) {
  return (
    <MotionDiv whileHover={{ y: -4 }} className="h-full">
      <Card className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">{event.groupName}</p>
          <Badge variant="outline" size="sm">{formatDistanceLabel(event.distance)}</Badge>
        </div>
        <h3 className="mt-3 text-lg font-bold">{event.title}</h3>
        <div className="mt-4 grid gap-2 text-sm text-fg-secondary">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            {formatDate(event.date)}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {event.location}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {event.confirmedCount} confirmados
          </p>
        </div>
        {action ? <div className="mt-auto pt-5">{action}</div> : null}
      </Card>
    </MotionDiv>
  )
}
